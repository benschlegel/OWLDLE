import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import type { AnswerKey } from '@/types/database';
import type { DayPoint, DayScope } from '@/types/statistics';
import { getStatisticsCollections } from './client';

const HOUR_MS = 3_600_000;
/** Min games an iteration needs before it can rank as a "hardest puzzle". */
const MIN_HARDEST_SAMPLE = 10;

export type RawStatistics = {
	summary: { gamesPlayed: number; wins: number; winGuessSum: number; solvedFirst: number };
	distribution: { bucket: string; count: number }[];
	firstGuesses: { id: number; name: string; count: number }[];
	hardestPuzzles: { iteration: number; player: string; played: number; wins: number }[];
};

const EMPTY_RAW: RawStatistics = { summary: { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 }, distribution: [], firstGuesses: [], hardestPuzzles: [] };

/** Start of today's in-progress puzzle (ms). Games finishing before this are completed. */
export async function getStatsBoundaryMs(dataset: Dataset, useProd = false): Promise<number | null> {
	const { answerCollection } = getStatisticsCollections(useProd);
	const answer = await answerCollection.findOne({ _id: `current_${dataset}` as AnswerKey });
	if (!answer) return null;
	return new Date(answer.nextReset).getTime() - GAME_CONFIG.nextResetHours * HOUR_MS;
}

/** Total games ever logged across every dataset/mode. Uses collection metadata (O(1)). */
export async function getGlobalGamesPlayed(useProd = false): Promise<number> {
	const { gameLogCollection } = getStatisticsCollections(useProd);
	return gameLogCollection.estimatedDocumentCount();
}

/** Run all statistics aggregation for a dataset over [fromMs, toMs). */
export async function getRawStatistics(dataset: Dataset, fromMs: number, toMs: number, useProd = false): Promise<RawStatistics> {
	if (fromMs >= toMs) return EMPTY_RAW;

	const { gameLogCollection, iterationCollection } = getStatisticsCollections(useProd);

	const match = { dataset, finishedAt: { $gte: new Date(fromMs), $lt: new Date(toMs) } };

	const cond = (expr: unknown) => ({ $cond: [expr, 1, 0] });
	const isWon = { $eq: ['$gameResult', 'won'] };

	const [agg] = await gameLogCollection
		.aggregate([
			{ $match: match },
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
					distribution: [
						{
							$group: {
								_id: { $cond: [isWon, { $toString: { $size: '$gameData' } }, 'failed'] },
								count: { $sum: 1 },
							},
						},
					],
					firstGuesses: [
						{
							$group: {
								_id: { id: { $arrayElemAt: ['$gameData.player.id', 0] }, name: { $arrayElemAt: ['$gameData.player.name', 0] } },
								count: { $sum: 1 },
							},
						},
						{ $sort: { count: -1 } },
					],
					perIteration: [
						{ $group: { _id: '$iteration', played: { $sum: 1 }, wins: { $sum: cond(isWon) } } },
					],
				},
			},
		] as any)
		.toArray();

	const summaryRow = agg?.summary?.[0] ?? { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 };

	// Rank hardest puzzles, then resolve answer player for only the top few.
	type RankedIteration = { iteration: number; played: number; wins: number };
	const ranked: RankedIteration[] = (agg?.perIteration ?? [])
		.filter((r: { played: number }) => r.played >= MIN_HARDEST_SAMPLE)
		.map((r: { _id: number; played: number; wins: number }) => ({ iteration: r._id, played: r.played, wins: r.wins }))
		.sort((a: { wins: number; played: number }, b: { wins: number; played: number }) => a.wins / a.played - b.wins / b.played)
		.slice(0, 20);

	let hardestPuzzles: RawStatistics['hardestPuzzles'] = [];
	if (ranked.length > 0) {
		const iterDocs = await iterationCollection
			.find({ dataset, iteration: { $in: ranked.map((r: RankedIteration) => r.iteration) } }, { projection: { iteration: 1, 'player.name': 1, _id: 0 } })
			.toArray();
		const nameByIter = new Map(iterDocs.map((d) => [d.iteration, d.player?.name ?? `#${d.iteration}`]));
		hardestPuzzles = ranked.map((r: RankedIteration) => ({ ...r, player: nameByIter.get(r.iteration) ?? `#${r.iteration}` }));
	}

	return {
		summary: {
			gamesPlayed: summaryRow.gamesPlayed ?? 0,
			wins: summaryRow.wins ?? 0,
			winGuessSum: summaryRow.winGuessSum ?? 0,
			solvedFirst: summaryRow.solvedFirst ?? 0,
		},
		distribution: (agg?.distribution ?? []).map((d: { _id: string; count: number }) => ({ bucket: d._id, count: d.count })),
		firstGuesses: (agg?.firstGuesses ?? [])
			.filter((g: { _id: { id: number | null; name: string | null } }) => g._id?.id != null && g._id?.name != null)
			.map((g: { _id: { id: number; name: string }; count: number }) => ({ id: g._id.id, name: g._id.name, count: g.count })),
		hardestPuzzles,
	};
}

/**
 * Per-day series over [fromMs, toMs). With `scope: 'current'` it covers the given dataset and
 * resolves each day's answer player (from the iterations collection); with `scope: 'all'` it sums
 * every dataset together (no per-day answer, since multiple datasets share a calendar day).
 * Returns daily granularity — the client aggregates into weeks/months as needed.
 */
export async function getPerDaySeries(dataset: Dataset, fromMs: number, toMs: number, scope: DayScope, useProd = false): Promise<DayPoint[]> {
	if (fromMs >= toMs) return [];
	return scope === 'all' ? getPerDayAllModes(fromMs, toMs, useProd) : getPerDayCurrent(dataset, fromMs, toMs, useProd);
}

const COUNT_ACCUMULATORS = {
	played: { $sum: 1 },
	wins: { $sum: { $cond: [{ $eq: ['$gameResult', 'won'] }, 1, 0] } },
	totalGuesses: { $sum: { $size: '$gameData' } },
	winGuessSum: { $sum: { $cond: [{ $eq: ['$gameResult', 'won'] }, { $size: '$gameData' }, 0] } },
};

/** Single-dataset per-day series, with each day's answer player resolved. */
async function getPerDayCurrent(dataset: Dataset, fromMs: number, toMs: number, useProd: boolean): Promise<DayPoint[]> {
	const { gameLogCollection, iterationCollection } = getStatisticsCollections(useProd);

	const rows = (await gameLogCollection
		.aggregate([
			{ $match: { dataset, finishedAt: { $gte: new Date(fromMs), $lt: new Date(toMs) } } },
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$finishedAt', timezone: 'UTC' } },
					...COUNT_ACCUMULATORS,
					iteration: { $first: '$iteration' },
				},
			},
			{ $sort: { _id: 1 } },
		] as any)
		.toArray()) as { _id: string; played: number; wins: number; totalGuesses: number; winGuessSum: number; iteration: number | null }[];

	const points: DayPoint[] = rows.map((d) => ({ date: d._id, played: d.played, wins: d.wins, totalGuesses: d.totalGuesses, winGuessSum: d.winGuessSum }));

	if (rows.length > 0) {
		const iterations = [...new Set(rows.map((r) => r.iteration).filter((i): i is number => typeof i === 'number'))];
		if (iterations.length > 0) {
			const iterDocs = await iterationCollection
				.find({ dataset, iteration: { $in: iterations } }, { projection: { iteration: 1, 'player.name': 1, _id: 0 } })
				.toArray();
			const nameByIter = new Map(iterDocs.map((d) => [d.iteration, d.player?.name]));
			rows.forEach((r, i) => {
				const name = typeof r.iteration === 'number' ? nameByIter.get(r.iteration) : undefined;
				if (name) points[i].answer = name;
			});
		}
	}

	return points;
}

/** Every-dataset per-day series: grouped by (day, dataset) so each day carries a per-mode breakdown plus the summed totals. */
async function getPerDayAllModes(fromMs: number, toMs: number, useProd: boolean): Promise<DayPoint[]> {
	const { gameLogCollection } = getStatisticsCollections(useProd);

	const rows = (await gameLogCollection
		.aggregate([
			{ $match: { finishedAt: { $gte: new Date(fromMs), $lt: new Date(toMs) } } },
			{
				$group: {
					_id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$finishedAt', timezone: 'UTC' } }, dataset: '$dataset' },
					...COUNT_ACCUMULATORS,
				},
			},
			{ $sort: { '_id.date': 1 } },
		] as any)
		.toArray()) as { _id: { date: string; dataset: string }; played: number; wins: number; totalGuesses: number; winGuessSum: number }[];

	const byDate = new Map<string, DayPoint>();
	for (const r of rows) {
		let dp = byDate.get(r._id.date);
		if (!dp) {
			dp = { date: r._id.date, played: 0, wins: 0, totalGuesses: 0, winGuessSum: 0, breakdown: [] };
			byDate.set(r._id.date, dp);
		}
		dp.played += r.played;
		dp.wins += r.wins;
		dp.totalGuesses += r.totalGuesses;
		dp.winGuessSum += r.winGuessSum;
		dp.breakdown?.push({ dataset: r._id.dataset, played: r.played, wins: r.wins, totalGuesses: r.totalGuesses, winGuessSum: r.winGuessSum });
	}

	return [...byDate.values()];
}
