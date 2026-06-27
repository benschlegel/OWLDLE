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

const EMPTY_RAW: RawStatistics = {
	summary: { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 },
	distribution: [],
	firstGuesses: [],
	hardestPuzzles: [],
};

/** Start of today's in-progress puzzle (ms). Games finishing before this are completed. */
export async function getStatsBoundaryMs(dataset: Dataset): Promise<number | null> {
	const { answerCollection } = getStatisticsCollections();
	const answer = await answerCollection.findOne({ _id: `current_${dataset}` as AnswerKey });
	if (!answer) return null;
	return new Date(answer.nextReset).getTime() - GAME_CONFIG.nextResetHours * HOUR_MS;
}

/** Total games ever logged across every dataset/mode. Uses collection metadata (O(1)). */
export async function getGlobalGamesPlayed(): Promise<number> {
	const { gameLogCollection } = getStatisticsCollections();
	return gameLogCollection.estimatedDocumentCount();
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Distinct game_logs dataset keys for a base dataset: the base plus any `<base>-stage<N>` archives.
 *  The anchored prefix regex uses the {dataset:1, finishedAt:1} index. */
export async function getDatasetStageKeys(base: string): Promise<string[]> {
	const { gameLogCollection } = getStatisticsCollections();
	const keys = await gameLogCollection.distinct('dataset', { dataset: { $regex: `^${escapeRegExp(base)}(-stage\\d+)?$` } });
	return keys as string[];
}

/** Run all statistics aggregation for a dataset over [fromMs, toMs). */
export async function getRawStatistics(dataset: Dataset, fromMs: number, toMs: number, datasetKeys: string[] = [dataset]): Promise<RawStatistics> {
	if (fromMs >= toMs) return EMPTY_RAW;

	const { gameLogCollection, iterationCollection } = getStatisticsCollections();

	const dsFilter = datasetKeys.length === 1 ? datasetKeys[0] : { $in: datasetKeys };
	const match = { dataset: dsFilter, finishedAt: { $gte: new Date(fromMs), $lt: new Date(toMs) } };

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
					perIteration: [{ $group: { _id: { dataset: '$dataset', iteration: '$iteration' }, played: { $sum: 1 }, wins: { $sum: cond(isWon) } } }],
				},
			},
		] as any)
		.toArray();

	const summaryRow = agg?.summary?.[0] ?? { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 };

	// Rank hardest puzzles, then resolve answer player for only the top few.
	type RankedIteration = { dataset: string; iteration: number; played: number; wins: number };
	const ranked: RankedIteration[] = (agg?.perIteration ?? [])
		.filter((r: { played: number }) => r.played >= MIN_HARDEST_SAMPLE)
		.map((r: { _id: { dataset: string; iteration: number }; played: number; wins: number }) => ({ dataset: r._id.dataset, iteration: r._id.iteration, played: r.played, wins: r.wins }))
		.sort((a: { wins: number; played: number }, b: { wins: number; played: number }) => a.wins / a.played - b.wins / b.played)
		.slice(0, 20);

	let hardestPuzzles: RawStatistics['hardestPuzzles'] = [];
	if (ranked.length > 0) {
		const iterDocs = await iterationCollection
			.find({ dataset: { $in: datasetKeys } as any, iteration: { $in: ranked.map((r: RankedIteration) => r.iteration) } }, { projection: { dataset: 1, iteration: 1, 'player.name': 1, _id: 0 } })
			.toArray();
		const nameByKey = new Map(iterDocs.map((d) => [`${d.dataset}-${d.iteration}`, d.player?.name ?? `#${d.iteration}`]));
		hardestPuzzles = ranked.map((r: RankedIteration) => ({ iteration: r.iteration, played: r.played, wins: r.wins, player: nameByKey.get(`${r.dataset}-${r.iteration}`) ?? `#${r.iteration}` }));
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
export async function getPerDaySeries(dataset: Dataset, fromMs: number, toMs: number, scope: DayScope, datasetKeys: string[] = [dataset]): Promise<DayPoint[]> {
	if (fromMs >= toMs) return [];
	return scope === 'all' ? getPerDayAllModes(fromMs, toMs) : getPerDayCurrent(datasetKeys, fromMs, toMs);
}

const COUNT_ACCUMULATORS = {
	played: { $sum: 1 },
	wins: { $sum: { $cond: [{ $eq: ['$gameResult', 'won'] }, 1, 0] } },
	totalGuesses: { $sum: { $size: '$gameData' } },
	winGuessSum: { $sum: { $cond: [{ $eq: ['$gameResult', 'won'] }, { $size: '$gameData' }, 0] } },
};

/** Single-dataset (or multi-stage) per-day series, with each day's answer player resolved. */
async function getPerDayCurrent(datasetKeys: string[], fromMs: number, toMs: number): Promise<DayPoint[]> {
	const { gameLogCollection, iterationCollection } = getStatisticsCollections();

	const dsFilter = datasetKeys.length === 1 ? datasetKeys[0] : { $in: datasetKeys };
	const rows = (await gameLogCollection
		.aggregate([
			{ $match: { dataset: dsFilter, finishedAt: { $gte: new Date(fromMs), $lt: new Date(toMs) } } },
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$finishedAt', timezone: 'UTC' } },
					...COUNT_ACCUMULATORS,
					iteration: { $first: '$iteration' },
					dataset: { $first: '$dataset' },
				},
			},
			{ $sort: { _id: 1 } },
		] as any)
		.toArray()) as { _id: string; played: number; wins: number; totalGuesses: number; winGuessSum: number; iteration: number | null; dataset: string }[];

	const points: DayPoint[] = rows.map((d) => ({ date: d._id, played: d.played, wins: d.wins, totalGuesses: d.totalGuesses, winGuessSum: d.winGuessSum }));

	if (rows.length > 0) {
		const iterations = [...new Set(rows.map((r) => r.iteration).filter((i): i is number => typeof i === 'number'))];
		if (iterations.length > 0) {
			const iterDocs = await iterationCollection
				.find({ dataset: { $in: datasetKeys } as any, iteration: { $in: iterations } }, { projection: { dataset: 1, iteration: 1, 'player.name': 1, _id: 0 } })
				.toArray();
			const nameByKey = new Map(iterDocs.map((d) => [`${d.dataset}-${d.iteration}`, d.player?.name]));
			rows.forEach((r, i) => {
				const name = typeof r.iteration === 'number' ? nameByKey.get(`${r.dataset}-${r.iteration}`) : undefined;
				if (name) points[i].answer = name;
			});
		}
	}

	return points;
}

export type RawOverview = {
	byDataset: { dataset: string; played: number; wins: number; winGuessSum: number }[];
	byWeekdayHour: { weekday: number; hour: number; dataset: string; played: number }[];
	firstRole: { dataset: string; id: number | null; count: number }[];
	allRole: { dataset: string; id: number | null; count: number }[];
};

const EMPTY_OVERVIEW: RawOverview = { byDataset: [], byWeekdayHour: [], firstRole: [], allRole: [] };

/**
 * All-time, all-dataset aggregates for the "Big Picture" overview section. No timeframe or dataset
 * filter, these are aggregate counts only (they reveal no answers), so today's in-progress games
 * are intentionally included. `byWeekdayHour` (grouped by dataset) drives the weekday bars, the
 * hour-of-day area, and the heatmap; `firstRole`/`allRole` carry (dataset, id) so roles can be
 * resolved server-side against the roster (the log has no role).
 */
export async function getOverviewStatistics(): Promise<RawOverview> {
	const { gameLogCollection } = getStatisticsCollections();
	const isWon = { $eq: ['$gameResult', 'won'] };
	const tz = 'UTC';

	const [agg] = await gameLogCollection
		.aggregate([
			{
				$facet: {
					byDataset: [
						{
							$group: {
								_id: '$dataset',
								played: { $sum: 1 },
								wins: { $sum: { $cond: [isWon, 1, 0] } },
								winGuessSum: { $sum: { $cond: [isWon, { $size: '$gameData' }, 0] } },
							},
						},
					],
					byWeekdayHour: [
						{
							$group: {
								_id: {
									weekday: { $isoDayOfWeek: { date: '$finishedAt', timezone: tz } },
									hour: { $hour: { date: '$finishedAt', timezone: tz } },
									dataset: '$dataset',
								},
								played: { $sum: 1 },
							},
						},
					],
					firstRole: [{ $group: { _id: { dataset: '$dataset', id: { $arrayElemAt: ['$gameData.player.id', 0] } }, count: { $sum: 1 } } }],
					allRole: [{ $unwind: '$gameData' }, { $group: { _id: { dataset: '$dataset', id: '$gameData.player.id' }, count: { $sum: 1 } } }],
				},
			},
		] as any)
		.toArray();

	if (!agg) return EMPTY_OVERVIEW;

	return {
		byDataset: (agg.byDataset ?? []).map((d: { _id: string; played: number; wins: number; winGuessSum: number }) => ({
			dataset: d._id,
			played: d.played,
			wins: d.wins,
			winGuessSum: d.winGuessSum,
		})),
		byWeekdayHour: (agg.byWeekdayHour ?? []).map((d: { _id: { weekday: number; hour: number; dataset: string }; played: number }) => ({
			weekday: d._id.weekday,
			hour: d._id.hour,
			dataset: d._id.dataset,
			played: d.played,
		})),
		firstRole: (agg.firstRole ?? []).map((d: { _id: { dataset: string; id: number | null }; count: number }) => ({
			dataset: d._id.dataset,
			id: d._id.id,
			count: d.count,
		})),
		allRole: (agg.allRole ?? []).map((d: { _id: { dataset: string; id: number | null }; count: number }) => ({
			dataset: d._id.dataset,
			id: d._id.id,
			count: d.count,
		})),
	};
}

/** Every-dataset per-day series: grouped by (day, dataset) so each day carries a per-mode breakdown plus the summed totals. */
async function getPerDayAllModes(fromMs: number, toMs: number): Promise<DayPoint[]> {
	const { gameLogCollection } = getStatisticsCollections();

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
