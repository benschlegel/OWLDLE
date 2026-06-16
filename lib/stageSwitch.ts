import type { Db, ClientSession } from 'mongodb';
import type { Dataset } from '@/data/datasetIds';
import { SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { GAME_CONFIG } from '@/lib/config';
import type { DbPlayer } from '@/types/database';

export type StageArchiveName = `${Dataset}-stage${number}`;
export type StagingKey = `${Dataset}__staging`;

/**
 * Returns the archive key for a stage being retired.
 * e.g. archiveName('owcs-s3', 1) → 'owcs-s3-stage1'
 */
export const archiveName = (base: Dataset, n: number): StageArchiveName => `${base}-stage${n}` as StageArchiveName;

/**
 * Returns the ephemeral staging key used during preparation.
 * e.g. stagingKey('owcs-s3') → 'owcs-s3__staging'
 * This key must never appear in the DATASETS union.
 */
export const stagingKey = (base: Dataset): StagingKey => `${base}__staging` as StagingKey;

// ─── Collection name constants ────────────────────────────────────────────────

export const COLLECTION_NAMES = {
	players: 'players',
	backlog: 'backlog',
	answers: 'answers',
	iterations: 'iterations',
	gameLogs: 'game_logs',
} as const;

// ─── Internal type ────────────────────────────────────────────────────────────

type DatasetKey = Dataset | StageArchiveName | StagingKey;

// ─── Low-level move helpers ───────────────────────────────────────────────────

/**
 * Copy an _id-keyed document to a new _id, then delete the original.
 * No-op if the source document is absent.
 */
async function moveIdDoc(db: Db, collection: string, fromId: string, toId: string, session?: ClientSession): Promise<void> {
	const col = db.collection<{ _id: string }>(collection);
	const doc = await col.findOne({ _id: fromId } as any, { session });
	if (!doc) return;
	const newDoc = { ...doc, _id: toId };
	await col.insertOne(newDoc as any, { session });
	await col.deleteOne({ _id: fromId } as any, { session });
}

/**
 * Re-key the current_/next_ answer docs for a dataset.
 */
async function moveAnswers(db: Db, from: DatasetKey, to: DatasetKey, session?: ClientSession): Promise<void> {
	await moveIdDoc(db, COLLECTION_NAMES.answers, `current_${from}`, `current_${to}`, session);
	await moveIdDoc(db, COLLECTION_NAMES.answers, `next_${from}`, `next_${to}`, session);
}

/**
 * Re-key field-based docs in a collection (iterations / game_logs).
 */
async function moveDatasetField(db: Db, collection: string, from: DatasetKey, to: DatasetKey, session?: ClientSession): Promise<void> {
	await db.collection(collection).updateMany({ dataset: from } as any, { $set: { dataset: to } } as any, { session });
}

/**
 * Move ALL five collections from `from` to `to`.
 * Order: _id-keyed first (players, backlog, answers), then field-keyed.
 */
export async function moveAllCollections(db: Db, from: DatasetKey, to: DatasetKey, session?: ClientSession): Promise<void> {
	await moveIdDoc(db, COLLECTION_NAMES.players, from, to, session);
	await moveIdDoc(db, COLLECTION_NAMES.backlog, from, to, session);
	await moveAnswers(db, from, to, session);
	await moveDatasetField(db, COLLECTION_NAMES.iterations, from, to, session);
	await moveDatasetField(db, COLLECTION_NAMES.gameLogs, from, to, session);
}

// ─── Atomic swap / rollback (require a session/transaction) ──────────────────

/**
 * Archive live records (base → archiveName(base, n)), then promote staged records
 * onto the live key (stagingKey(base) → base). Both sides of the swap happen
 * inside the caller's transaction.
 *
 * Order matters: archive first so the base _ids are freed before the promote
 * step writes them.
 */
export async function swapStage(db: Db, base: Dataset, n: number, session: ClientSession): Promise<void> {
	await moveAllCollections(db, base, archiveName(base, n), session);
	await moveAllCollections(db, stagingKey(base), base, session);
}

/**
 * Restore a previously archived stage onto the live key.
 * Parks the current live records back under the staging key.
 */
export async function rollbackStage(db: Db, base: Dataset, n: number, session: ClientSession): Promise<void> {
	await moveAllCollections(db, base, stagingKey(base), session);
	await moveAllCollections(db, archiveName(base, n), base, session);
}

// ─── prepareStaging ───────────────────────────────────────────────────────────

/**
 * Seed the new stage's full DB state under stagingKey(base).
 * Writes: players doc, backlog doc, current + next answers, first iterations doc.
 * Safe to call without a transaction — nothing reads the staging key.
 */
export async function prepareStaging(db: Db, base: Dataset, currentPlayer: DbPlayer, nextPlayer: DbPlayer, firstReset: Date, secondReset: Date): Promise<void> {
	const sk = stagingKey(base);

	// Build new roster from SORTED_PLAYERS
	const roster = SORTED_PLAYERS.find((p) => p.dataset === base)?.players ?? [];
	const dbPlayers: DbPlayer[] = roster.map(formattedToDbPlayer);

	// players doc
	await db.collection(COLLECTION_NAMES.players).updateOne({ _id: sk } as any, { $set: { _id: sk, players: dbPlayers } } as any, { upsert: true });

	// Backlog: all roster players except the two answers, shuffled, capped at backlogMaxSize
	const excluded = new Set([currentPlayer.name, nextPlayer.name]);
	const backlogCandidates = dbPlayers.filter((p) => !excluded.has(p.name));
	// Fisher-Yates shuffle
	for (let i = backlogCandidates.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[backlogCandidates[i], backlogCandidates[j]] = [backlogCandidates[j], backlogCandidates[i]];
	}
	const backlogPlayers = backlogCandidates.slice(0, GAME_CONFIG.backlogMaxSize);

	await db.collection(COLLECTION_NAMES.backlog).updateOne({ _id: sk } as any, { $set: { _id: sk, players: backlogPlayers } } as any, { upsert: true });

	// answers: current (iteration 1) + next (iteration 2)
	const currentAnswerKey = `current_${sk}`;
	const nextAnswerKey = `next_${sk}`;
	await db
		.collection(COLLECTION_NAMES.answers)
		.updateOne({ _id: currentAnswerKey } as any, { $set: { _id: currentAnswerKey, player: currentPlayer, iteration: 1, nextReset: firstReset } } as any, {
			upsert: true,
		});
	await db
		.collection(COLLECTION_NAMES.answers)
		.updateOne({ _id: nextAnswerKey } as any, { $set: { _id: nextAnswerKey, player: nextPlayer, iteration: 2, nextReset: secondReset } } as any, {
			upsert: true,
		});

	// First iteration record
	await db.collection(COLLECTION_NAMES.iterations).insertOne({ dataset: sk, iteration: 1, player: currentPlayer, resetAt: firstReset } as any);
}

// ─── Precondition check ───────────────────────────────────────────────────────

export type SwitchPreconditions = { ok: boolean; reason?: string };

/**
 * Verify it is safe to proceed with a stage swap:
 * - The archive key (base-stageN) must not already have a players doc (idempotency guard).
 * - The live base must have a players doc and a current answer (something to archive).
 * - The staging key must be clean (no leftover players doc from a stale prepare).
 */
export async function checkSwitchPreconditions(db: Db, base: Dataset, n: number): Promise<SwitchPreconditions> {
	const archive = archiveName(base, n);
	const sk = stagingKey(base);

	// Idempotency guard
	const archiveDoc = await db.collection(COLLECTION_NAMES.players).findOne({ _id: archive } as any);
	if (archiveDoc) {
		return {
			ok: false,
			reason: `Archive ${archive} already exists in 'players'. Has this stage already been switched? Run with ROLLBACK=true to restore, or clean up the archive manually.`,
		};
	}

	// Live base must exist
	const baseDoc = await db.collection(COLLECTION_NAMES.players).findOne({ _id: base } as any);
	if (!baseDoc) {
		return {
			ok: false,
			reason: `No players doc found for live dataset '${base}'. Nothing to archive.`,
		};
	}

	const currentAnswer = await db.collection(COLLECTION_NAMES.answers).findOne({ _id: `current_${base}` } as any);
	if (!currentAnswer) {
		return {
			ok: false,
			reason: `No current answer found for dataset '${base}'. Cannot proceed.`,
		};
	}

	// Staging key must be clean
	const stagingDoc = await db.collection(COLLECTION_NAMES.players).findOne({ _id: sk } as any);
	if (stagingDoc) {
		return {
			ok: false,
			reason: `Stale staging data found under '${sk}'. Clean up the staging key before running again (delete from players, backlog, answers, iterations).`,
		};
	}

	return { ok: true };
}

// ─── Orchestrators ────────────────────────────────────────────────────────────

/**
 * Full stage switch:
 * 1. Precondition check
 * 2. prepareStaging (no live impact)
 * 3. swapStage inside a transaction (atomic, no broken window)
 */
export async function runStageSwitch(
	db: Db,
	client: { startSession(): ClientSession },
	opts: {
		base: Dataset;
		endingStage: number;
		currentPlayer: DbPlayer;
		nextPlayer: DbPlayer;
		firstReset: Date;
		secondReset: Date;
	}
): Promise<void> {
	const pre = await checkSwitchPreconditions(db, opts.base, opts.endingStage);
	if (!pre.ok) throw new Error(`Switch preconditions failed: ${pre.reason}`);

	await prepareStaging(db, opts.base, opts.currentPlayer, opts.nextPlayer, opts.firstReset, opts.secondReset);

	const session = client.startSession();
	try {
		await session.withTransaction(async () => {
			await swapStage(db, opts.base, opts.endingStage, session);
		});
	} finally {
		await session.endSession();
	}
}

/**
 * Restore the previously archived stage onto the live key.
 * Parks the current live records under the staging key.
 */
export async function runStageRollback(db: Db, client: { startSession(): ClientSession }, base: Dataset, endingStage: number): Promise<void> {
	const session = client.startSession();
	try {
		await session.withTransaction(async () => {
			await rollbackStage(db, base, endingStage, session);
		});
	} finally {
		await session.endSession();
	}
}
