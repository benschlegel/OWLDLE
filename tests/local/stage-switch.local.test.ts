import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { MongoClient, type Db } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { archiveName, stagingKey, moveAllCollections, swapStage, rollbackStage, checkSwitchPreconditions, COLLECTION_NAMES } from '@/lib/stageSwitch';
import type { Dataset } from '@/data/datasetIds';

const BASE: Dataset = 'owcs-s3';
const STAGE_N = 1;

type FakePlayer = { name: string; id: number; role: string; team: string; country: string };

const makePlayer = (name: string, id: number): FakePlayer => ({
	name,
	id,
	role: 'Damage',
	team: 'Team A',
	country: 'US',
});

const oldPlayerA = makePlayer('OldPlayer_A', 1);
const oldPlayerB = makePlayer('OldPlayer_B', 2);
const oldPlayerC = makePlayer('OldPlayer_C', 3); // carry-over (in both rosters)
const newPlayerX = makePlayer('NewPlayer_X', 10);
const newPlayerY = makePlayer('NewPlayer_Y', 11);

// Old-stage live state (seeded under BASE)
const oldLivePlayers = [oldPlayerA, oldPlayerB, oldPlayerC];
const oldCurrentAnswer = {
	_id: `current_${BASE}`,
	player: oldPlayerA,
	iteration: 42,
	nextReset: new Date('2026-01-01'),
};
const oldNextAnswer = {
	_id: `next_${BASE}`,
	player: oldPlayerB,
	iteration: 43,
	nextReset: new Date('2026-01-02'),
};
const oldBacklog = { _id: BASE, players: [oldPlayerC] };
const oldIteration1 = { dataset: BASE, iteration: 42, player: oldPlayerA, resetAt: new Date('2026-01-01') };
const oldIteration2 = { dataset: BASE, iteration: 41, player: oldPlayerB, resetAt: new Date('2025-12-31') };
const oldGameLog = { dataset: BASE, iteration: 42, finishedAt: new Date('2026-01-01'), gameData: [], gameResult: 'won' };

// Staged state (seeded under stagingKey(BASE))
const sk = stagingKey(BASE);
const stagedPlayers = [oldPlayerC, newPlayerX, newPlayerY]; // new roster (oldPlayerC is carry-over)
const stagedCurrentAnswer = {
	_id: `current_${sk}`,
	player: oldPlayerC,
	iteration: 1,
	nextReset: new Date('2026-02-01'),
};
const stagedNextAnswer = {
	_id: `next_${sk}`,
	player: newPlayerX,
	iteration: 2,
	nextReset: new Date('2026-02-02'),
};
const stagedBacklog = { _id: sk, players: [newPlayerY] };
const stagedIteration = { dataset: sk, iteration: 1, player: oldPlayerC, resetAt: new Date('2026-02-01') };

let repl: MongoMemoryReplSet;
let client: MongoClient;
let db: Db;

beforeAll(async () => {
	repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
	client = new MongoClient(repl.getUri());
	await client.connect();
	db = client.db('test');
}, 60_000);

afterAll(async () => {
	await client?.close();
	await repl?.stop();
});

async function clearAll() {
	await db.collection(COLLECTION_NAMES.players).deleteMany({});
	await db.collection(COLLECTION_NAMES.backlog).deleteMany({});
	await db.collection(COLLECTION_NAMES.answers).deleteMany({});
	await db.collection(COLLECTION_NAMES.iterations).deleteMany({});
	await db.collection(COLLECTION_NAMES.gameLogs).deleteMany({});
}

async function seedLiveState() {
	await db.collection(COLLECTION_NAMES.players).insertOne({ _id: BASE, players: oldLivePlayers } as any);
	await db.collection(COLLECTION_NAMES.backlog).insertOne(oldBacklog as any);
	await db.collection(COLLECTION_NAMES.answers).insertOne(oldCurrentAnswer as any);
	await db.collection(COLLECTION_NAMES.answers).insertOne(oldNextAnswer as any);
	await db.collection(COLLECTION_NAMES.iterations).insertMany([oldIteration1, oldIteration2] as any[]);
	await db.collection(COLLECTION_NAMES.gameLogs).insertOne(oldGameLog as any);
}

async function seedStagingState() {
	await db.collection(COLLECTION_NAMES.players).insertOne({ _id: sk, players: stagedPlayers } as any);
	await db.collection(COLLECTION_NAMES.backlog).insertOne(stagedBacklog as any);
	await db.collection(COLLECTION_NAMES.answers).insertOne(stagedCurrentAnswer as any);
	await db.collection(COLLECTION_NAMES.answers).insertOne(stagedNextAnswer as any);
	await db.collection(COLLECTION_NAMES.iterations).insertOne(stagedIteration as any);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('stage-switch: pure name helpers', () => {
	test('archiveName builds the correct key', () => {
		expect(archiveName('owcs-s3', 1)).toBe('owcs-s3-stage1');
		expect(archiveName('owcs-s3', 2)).toBe('owcs-s3-stage2');
	});

	test('stagingKey builds the correct key', () => {
		expect(stagingKey('owcs-s3')).toBe('owcs-s3__staging');
	});
});

describe('stage-switch: happy-path full-collection swap', () => {
	beforeEach(async () => {
		await clearAll();
		await seedLiveState();
		await seedStagingState();
	});

	test('after swap: BASE records equal staged data, archive equals old live data', async () => {
		await swapStage(db, BASE, STAGE_N);

		const archive = archiveName(BASE, STAGE_N);

		// players: BASE should now have the staged players
		const livePlayers = await db.collection(COLLECTION_NAMES.players).findOne({ _id: BASE } as any);
		expect(livePlayers).not.toBeNull();
		expect((livePlayers as any).players.map((p: FakePlayer) => p.name)).toEqual(stagedPlayers.map((p) => p.name));

		// players: archive should have old live players
		const archivePlayers = await db.collection(COLLECTION_NAMES.players).findOne({ _id: archive } as any);
		expect(archivePlayers).not.toBeNull();
		expect((archivePlayers as any).players.map((p: FakePlayer) => p.name)).toEqual(oldLivePlayers.map((p) => p.name));

		// staging key has no leftover players
		const stagingPlayers = await db.collection(COLLECTION_NAMES.players).findOne({ _id: sk } as any);
		expect(stagingPlayers).toBeNull();

		// answers: BASE current/next should reflect staged answers
		const liveCurrentAnswer = await db.collection(COLLECTION_NAMES.answers).findOne({ _id: `current_${BASE}` } as any);
		expect(liveCurrentAnswer).not.toBeNull();
		expect((liveCurrentAnswer as any).player.name).toBe(oldPlayerC.name);
		expect((liveCurrentAnswer as any).iteration).toBe(1);

		const liveNextAnswer = await db.collection(COLLECTION_NAMES.answers).findOne({ _id: `next_${BASE}` } as any);
		expect(liveNextAnswer).not.toBeNull();
		expect((liveNextAnswer as any).player.name).toBe(newPlayerX.name);

		// backlog: BASE should have staged backlog
		const liveBacklog = await db.collection(COLLECTION_NAMES.backlog).findOne({ _id: BASE } as any);
		expect(liveBacklog).not.toBeNull();
		expect((liveBacklog as any).players.map((p: FakePlayer) => p.name)).toEqual(stagedBacklog.players.map((p) => p.name));

		// iterations: BASE iterations should be the staged one (iteration=1)
		const liveIterations = await db
			.collection(COLLECTION_NAMES.iterations)
			.find({ dataset: BASE } as any)
			.toArray();
		expect(liveIterations).toHaveLength(1);
		expect(liveIterations[0].iteration).toBe(1);

		// iterations: archive iterations should have the old ones (iterations 41, 42)
		const archiveIterations = await db
			.collection(COLLECTION_NAMES.iterations)
			.find({ dataset: archive } as any)
			.toArray();
		expect(archiveIterations).toHaveLength(2);
		expect(archiveIterations.map((i: any) => i.iteration).sort()).toEqual([41, 42]);

		// game_logs: old game log should have moved to archive (not lost)
		const liveGameLogs = await db
			.collection(COLLECTION_NAMES.gameLogs)
			.find({ dataset: BASE } as any)
			.toArray();
		expect(liveGameLogs).toHaveLength(0); // staged state had no game logs for BASE

		const archiveGameLogs = await db
			.collection(COLLECTION_NAMES.gameLogs)
			.find({ dataset: archive } as any)
			.toArray();
		expect(archiveGameLogs).toHaveLength(1);
		expect((archiveGameLogs[0] as any).iteration).toBe(42);
	});
});

describe('stage-switch: answers + backlog archival (all five collections archived, not just iterations/players)', () => {
	beforeEach(async () => {
		await clearAll();
		await seedLiveState();
		await seedStagingState();
	});

	test('after swap, current_<archive>, next_<archive>, and backlog _id:<archive> all exist', async () => {
		await swapStage(db, BASE, STAGE_N);

		const archive = archiveName(BASE, STAGE_N);

		const archivedCurrentAnswer = await db.collection(COLLECTION_NAMES.answers).findOne({ _id: `current_${archive}` } as any);
		expect(archivedCurrentAnswer).not.toBeNull();
		expect((archivedCurrentAnswer as any).player.name).toBe(oldPlayerA.name);
		expect((archivedCurrentAnswer as any).iteration).toBe(42);

		const archivedNextAnswer = await db.collection(COLLECTION_NAMES.answers).findOne({ _id: `next_${archive}` } as any);
		expect(archivedNextAnswer).not.toBeNull();
		expect((archivedNextAnswer as any).player.name).toBe(oldPlayerB.name);

		const archivedBacklog = await db.collection(COLLECTION_NAMES.backlog).findOne({ _id: archive } as any);
		expect(archivedBacklog).not.toBeNull();
		expect((archivedBacklog as any).players.map((p: FakePlayer) => p.name)).toContain(oldPlayerC.name);
	});
});

describe('stage-switch: idempotency precondition guard, archive already exists', () => {
	beforeEach(async () => {
		await clearAll();
		await seedLiveState();
		await seedStagingState();
	});

	test('checkSwitchPreconditions returns ok:false once archive exists', async () => {
		// Perform the swap so archive is created
		await swapStage(db, BASE, STAGE_N);

		const result = await checkSwitchPreconditions(db, BASE, STAGE_N);
		expect(result.ok).toBe(false);
		expect(result.reason).toMatch(/already exists/);
	});
});

describe('stage-switch: idempotency precondition guard, clean state', () => {
	beforeEach(async () => {
		await clearAll();
		// Only seed live state (no staging), so preconditions should be satisfied
		await seedLiveState();
	});

	test('checkSwitchPreconditions returns ok:true when staging key is absent', async () => {
		const result = await checkSwitchPreconditions(db, BASE, STAGE_N);
		expect(result.ok).toBe(true);
		expect(result.reason).toBeUndefined();
	});
});

describe('stage-switch: idempotency precondition guard, stale staging', () => {
	beforeEach(async () => {
		await clearAll();
	});

	test('checkSwitchPreconditions returns ok:false when stale staging data exists', async () => {
		// Seed live base state
		await db.collection(COLLECTION_NAMES.players).insertOne({ _id: BASE, players: oldLivePlayers } as any);
		await db.collection(COLLECTION_NAMES.answers).insertOne(oldCurrentAnswer as any);
		// Insert a stale staging doc (simulate aborted previous prepare)
		await db.collection(COLLECTION_NAMES.players).insertOne({ _id: sk, players: [] } as any);

		const result = await checkSwitchPreconditions(db, BASE, STAGE_N);
		expect(result.ok).toBe(false);
		expect(result.reason).toMatch(/[Ss]tag/);
	});
});

describe('stage-switch: rollback restores original state', () => {
	beforeEach(async () => {
		await clearAll();
		await seedLiveState();
		await seedStagingState();
	});

	test('after swap then rollback, live BASE records equal original old-stage records', async () => {
		// Swap first
		await swapStage(db, BASE, STAGE_N);

		// Then rollback
		await rollbackStage(db, BASE, STAGE_N);

		// Live BASE players should be back to old roster
		const restoredPlayers = await db.collection(COLLECTION_NAMES.players).findOne({ _id: BASE } as any);
		expect(restoredPlayers).not.toBeNull();
		expect((restoredPlayers as any).players.map((p: FakePlayer) => p.name)).toEqual(oldLivePlayers.map((p) => p.name));

		// Live current answer should be back to original
		const restoredCurrentAnswer = await db.collection(COLLECTION_NAMES.answers).findOne({ _id: `current_${BASE}` } as any);
		expect(restoredCurrentAnswer).not.toBeNull();
		expect((restoredCurrentAnswer as any).player.name).toBe(oldPlayerA.name);
		expect((restoredCurrentAnswer as any).iteration).toBe(42);

		// Live backlog should be back to original
		const restoredBacklog = await db.collection(COLLECTION_NAMES.backlog).findOne({ _id: BASE } as any);
		expect(restoredBacklog).not.toBeNull();

		// Live iterations should be back to old (2 iterations: 41, 42)
		const restoredIterations = await db
			.collection(COLLECTION_NAMES.iterations)
			.find({ dataset: BASE } as any)
			.toArray();
		expect(restoredIterations).toHaveLength(2);

		// Game log should have come back to BASE
		const restoredGameLogs = await db
			.collection(COLLECTION_NAMES.gameLogs)
			.find({ dataset: BASE } as any)
			.toArray();
		expect(restoredGameLogs).toHaveLength(1);
	});
});

describe('stage-switch: moveAllCollections is a no-op on missing data', () => {
	beforeEach(async () => {
		await clearAll();
	});

	test('moving a non-existent dataset key does not throw', async () => {
		await expect(moveAllCollections(db, 'owcs-s3' as Dataset, 'owcs-s3-stage99' as any)).resolves.not.toThrow();
	});
});
