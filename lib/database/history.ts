import type { Dataset } from '@/data/datasets';
import { baseDataset, resolveStages } from '@/lib/statistics';
import type { AnswerKey, DbGuess } from '@/types/database';
import type { HistoryRandomGame } from '@/types/history';
import { getStatisticsCollections } from './client';
import { getDatasetStageKeys } from './statistics';

/** Raw, unshaped row for the history list (one past puzzle). `datasetKey` is the game_logs key it came from. */
export type RawHistoryEntry = { iteration: number; player: string; date: Date; played: number; wins: number; datasetKey: string };

/** Raw, unshaped detail for one puzzle (null when the iteration is missing or not yet past). */
export type RawHistoryDetail = {
	iteration: number;
	player: string;
	date: Date;
	summary: { gamesPlayed: number; wins: number; winGuessSum: number; solvedFirst: number };
	distribution: { bucket: string; count: number }[];
};

async function getCurrentIterationNumber(dataset: Dataset): Promise<number | null> {
	const { answerCollection } = getStatisticsCollections();
	const doc = await answerCollection.findOne({ _id: `current_${dataset}` as AnswerKey }, { projection: { iteration: 1, _id: 0 } });
	return doc?.iteration ?? null;
}

/**
 * A page of PAST puzzles for a dataset (yesterday and earlier), sorted iteration DESC.
 * `cursor` is the exclusive upper bound (the next page starts below it); omit for the first page.
 * `limit` defaults to 50. Returns the page entries and a `nextCursor` to pass for the next page
 * (null when no more pages remain).
 *
 * Spoiler guard: `iteration < current` always applies. Passing a cursor that equals or exceeds
 * the current iteration is silently clamped (guard is enforced server-side).
 */
export async function getRawHistory(dataset: Dataset, limit = 50, cursor?: number): Promise<{ entries: RawHistoryEntry[]; nextCursor: number | null }> {
	const current = await getCurrentIterationNumber(dataset);
	if (current === null) return { entries: [], nextCursor: null };

	const upperBound = cursor !== undefined ? Math.min(cursor, current) : current;

	const { gameLogCollection, iterationCollection } = getStatisticsCollections();

	// Fetch one extra to detect whether a next page exists.
	const iterDocs = await iterationCollection
		.find(
			{ dataset, iteration: { $lt: upperBound } },
			{ projection: { iteration: 1, 'player.name': 1, resetAt: 1, _id: 0 }, sort: { iteration: -1 }, limit: limit + 1 }
		)
		.toArray();

	const hasMore = iterDocs.length > limit;
	const pageIterDocs = hasMore ? iterDocs.slice(0, limit) : iterDocs;
	if (pageIterDocs.length === 0) return { entries: [], nextCursor: null };

	const iterationNumbers = pageIterDocs.map((d) => d.iteration);
	const counts = (await gameLogCollection
		.aggregate([
			{ $match: { dataset, iteration: { $in: iterationNumbers } } },
			{ $group: { _id: '$iteration', played: { $sum: 1 }, wins: { $sum: { $cond: [{ $eq: ['$gameResult', 'won'] }, 1, 0] } } } },
		] as any)
		.toArray()) as { _id: number; played: number; wins: number }[];

	const byIteration = new Map(counts.map((c) => [c._id, c]));
	const entries = pageIterDocs.map((d) => {
		const c = byIteration.get(d.iteration);
		return {
			iteration: d.iteration,
			player: d.player?.name ?? `#${d.iteration}`,
			date: d.resetAt,
			played: c?.played ?? 0,
			wins: c?.wins ?? 0,
			datasetKey: dataset,
		};
	});

	const nextCursor = hasMore ? pageIterDocs[pageIterDocs.length - 1].iteration : null;
	return { entries, nextCursor };
}

/**
 * ALL past puzzles for a dataset across the given stage keys (no pagination), sorted
 * stageKey-grouped + iteration DESC. Used by the history list, which loads everything at once so
 * client-side search/sort/grouping work across all iterations.
 *
 * Spoiler guard: only the LIVE base key (`dataset`) has a `current_<dataset>` answer, so the
 * `iteration < current` guard is applied to it alone. Archived `-stageN` keys have no live answer
 * and are fully past, so all their iterations are included.
 */
export async function getAllRawHistory(dataset: Dataset, datasetKeys: string[]): Promise<RawHistoryEntry[]> {
	const current = await getCurrentIterationNumber(dataset);
	const { gameLogCollection, iterationCollection } = getStatisticsCollections();

	// Per-key iteration filter: the live base excludes the current (unrevealed) iteration; if its
	// boundary is unknown (no current answer) the live base is omitted entirely to avoid spoilers.
	const orFilters = datasetKeys.flatMap((key) => {
		if (key === dataset) return current === null ? [] : [{ dataset: key, iteration: { $lt: current } }];
		return [{ dataset: key }];
	});
	if (orFilters.length === 0) return [];
	const iterDocs = await iterationCollection
		// biome-ignore lint/suspicious/noExplicitAny: stage keys (`-stageN`) are outside the Dataset enum
		.find({ $or: orFilters } as any, { projection: { dataset: 1, iteration: 1, 'player.name': 1, resetAt: 1, _id: 0 }, sort: { iteration: -1 } })
		.toArray();
	if (iterDocs.length === 0) return [];

	// One aggregate over every stage key for played/wins, grouped by (dataset, iteration).
	const counts = (await gameLogCollection
		.aggregate([
			{ $match: { dataset: { $in: datasetKeys } } },
			{
				$group: {
					_id: { dataset: '$dataset', iteration: '$iteration' },
					played: { $sum: 1 },
					wins: { $sum: { $cond: [{ $eq: ['$gameResult', 'won'] }, 1, 0] } },
				},
			},
			// Drop counts for the live base's current/future iterations (spoiler guard).
			...(current !== null ? [{ $match: { $or: [{ '_id.dataset': { $ne: dataset } }, { '_id.iteration': { $lt: current } }] } }] : []),
			// biome-ignore lint/suspicious/noExplicitAny: mongo aggregation pipeline
		] as any)
		.toArray()) as { _id: { dataset: string; iteration: number }; played: number; wins: number }[];

	const byKey = new Map(counts.map((c) => [`${c._id.dataset}:${c._id.iteration}`, c]));
	return iterDocs.map((d) => {
		const c = byKey.get(`${d.dataset}:${d.iteration}`);
		return {
			iteration: d.iteration,
			player: d.player?.name ?? `#${d.iteration}`,
			date: d.resetAt,
			played: c?.played ?? 0,
			wins: c?.wins ?? 0,
			datasetKey: d.dataset as string,
		};
	});
}

/**
 * A single random past game (one player's playthrough), or null if none. Sampled across ALL datasets
 * by default; pass a `dataset` to restrict to that dataset (all of its stages).
 */
export async function getRandomGame(dataset?: Dataset): Promise<HistoryRandomGame | null> {
	const { gameLogCollection, iterationCollection, playerCollection } = getStatisticsCollections();
	let match: Record<string, unknown> | null = null;
	if (dataset) {
		const existingKeys = await getDatasetStageKeys(dataset);
		const { datasetKeys } = resolveStages(dataset, existingKeys, 'all');
		match = { dataset: { $in: datasetKeys } };
	}
	const [doc] = (await gameLogCollection
		.aggregate([
			...(match ? [{ $match: match }] : []),
			{ $sample: { size: 1 } },
			{ $project: { _id: 0, dataset: 1, iteration: 1, gameResult: 1, finishedAt: 1, gameData: 1 } },
			// biome-ignore lint/suspicious/noExplicitAny: mongo aggregation pipeline
		] as any)
		.toArray()) as { dataset: string; iteration: number; gameResult: 'won' | 'lost'; finishedAt: Date; gameData: DbGuess[] }[];
	if (!doc) return null;

	// Look up the correct answer (the iteration's player name) for context display.
	// biome-ignore lint/suspicious/noExplicitAny: stage keys (`-stageN`) are outside the Dataset enum
	const iterDoc = await iterationCollection.findOne({ dataset: doc.dataset, iteration: doc.iteration } as any, { projection: { 'player.name': 1, _id: 0 } });

	// Resolve guessed players against the game's OWN roster (the `players` doc for this exact dataset
	// key, including archived stages) — the stored `player.id` is a positional index into that roster,
	// so this is the reliable source of truth for each guess's attributes.
	type RosterPlayer = { id: number; name: string; country: string; role: string; region: string | null; team: string };
	const rosterDoc =
		// biome-ignore lint/suspicious/noExplicitAny: stage keys (`-stageN`) are outside the Dataset enum
		((await playerCollection.findOne({ _id: doc.dataset } as any)) as { players?: RosterPlayer[] } | null) ??
		// biome-ignore lint/suspicious/noExplicitAny: fall back to the base dataset roster
		((await playerCollection.findOne({ _id: baseDataset(doc.dataset) } as any)) as { players?: RosterPlayer[] } | null);
	const roster = rosterDoc?.players ?? [];
	const byId = new Map(roster.map((p) => [p.id, p]));
	const byName = new Map(roster.map((p) => [p.name.toLowerCase(), p]));

	return {
		datasetKey: doc.dataset,
		iteration: doc.iteration,
		gameResult: doc.gameResult,
		finishedAt: doc.finishedAt.toISOString(),
		answer: iterDoc?.player?.name ?? `#${doc.iteration}`,
		guesses: (doc.gameData ?? []).map((g) => {
			const resolved = byId.get(g.player.id) ?? byName.get(g.player.name.toLowerCase());
			return {
				guessResult: g.guessResult,
				player: {
					name: resolved?.name ?? g.player.name,
					country: resolved?.country ?? '',
					role: resolved?.role ?? '',
					region: resolved?.region ?? null,
					team: resolved?.team ?? '',
				},
			};
		}),
	};
}

/**
 * Full detail for one PAST puzzle. `datasetKey` may be the live base dataset or an archived
 * `-stageN` key. Returns null if the iteration doesn't exist or (for the live base only) is the
 * current/future iteration (spoiler guard). Archived stages are fully past, so no guard applies.
 */
export async function getRawHistoryDetail(datasetKey: Dataset | string, iteration: number): Promise<RawHistoryDetail | null> {
	const base = baseDataset(datasetKey);
	const isLiveBase = datasetKey === base;
	if (isLiveBase) {
		const current = await getCurrentIterationNumber(base as Dataset);
		if (current === null || iteration >= current) return null;
	}

	const { gameLogCollection, iterationCollection } = getStatisticsCollections();

	const dataset = datasetKey;
	// biome-ignore lint/suspicious/noExplicitAny: stage keys (`-stageN`) are outside the Dataset enum
	const iterDoc = await iterationCollection.findOne({ dataset, iteration } as any, { projection: { 'player.name': 1, resetAt: 1, _id: 0 } });
	if (!iterDoc) return null;

	const cond = (expr: unknown) => ({ $cond: [expr, 1, 0] });
	const isWon = { $eq: ['$gameResult', 'won'] };

	const [agg] = await gameLogCollection
		.aggregate([
			{ $match: { dataset, iteration } },
			{
				$facet: {
					summary: [
						{
							$group: {
								_id: null,
								gamesPlayed: { $sum: 1 },
								wins: { $sum: cond(isWon) },
								winGuessSum: { $sum: { $cond: [isWon, { $size: '$gameData' }, 0] } },
								solvedFirst: { $sum: cond({ $and: [isWon, { $eq: [{ $size: '$gameData' }, 1] }] }) },
							},
						},
					],
					distribution: [{ $group: { _id: { $cond: [isWon, { $toString: { $size: '$gameData' } }, 'failed'] }, count: { $sum: 1 } } }],
				},
			},
		] as any)
		.toArray();

	const summaryRow = agg?.summary?.[0] ?? { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 };
	return {
		iteration,
		player: iterDoc.player?.name ?? `#${iteration}`,
		date: iterDoc.resetAt,
		summary: {
			gamesPlayed: summaryRow.gamesPlayed ?? 0,
			wins: summaryRow.wins ?? 0,
			winGuessSum: summaryRow.winGuessSum ?? 0,
			solvedFirst: summaryRow.solvedFirst ?? 0,
		},
		distribution: (agg?.distribution ?? []).map((d: { _id: string; count: number }) => ({ bucket: d._id, count: d.count })),
	};
}
