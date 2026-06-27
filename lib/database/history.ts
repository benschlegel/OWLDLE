import type { Dataset } from '@/data/datasets';
import type { AnswerKey } from '@/types/database';
import { getStatisticsCollections } from './client';

/** Raw, unshaped row for the history list (one past puzzle). */
export type RawHistoryEntry = { iteration: number; player: string; date: Date; played: number; wins: number };

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
		};
	});

	const nextCursor = hasMore ? pageIterDocs[pageIterDocs.length - 1].iteration : null;
	return { entries, nextCursor };
}

/**
 * Full detail for one PAST puzzle. Returns null if the iteration doesn't exist or is the
 * current/future iteration (spoiler guard, same `iteration < currentIteration` rule as the list).
 */
export async function getRawHistoryDetail(dataset: Dataset, iteration: number): Promise<RawHistoryDetail | null> {
	const current = await getCurrentIterationNumber(dataset);
	if (current === null || iteration >= current) return null;

	const { gameLogCollection, iterationCollection } = getStatisticsCollections();

	const iterDoc = await iterationCollection.findOne({ dataset, iteration }, { projection: { 'player.name': 1, resetAt: 1, _id: 0 } });
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
