import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { getCurrentAnswer } from './answers';
import { gameLogCollection, iterationCollection } from './client';

const HOUR_MS = 3_600_000;
/** Min games an iteration needs before it can rank as a "hardest puzzle". */
const MIN_HARDEST_SAMPLE = 10;

export type RawStatistics = {
	summary: { gamesPlayed: number; wins: number; winGuessSum: number; solvedFirst: number };
	distribution: { bucket: string; count: number }[];
	firstGuesses: { id: number; name: string; count: number }[];
	perDay: { date: string; played: number; wins: number }[];
	hardestPuzzles: { iteration: number; player: string; played: number; wins: number }[];
};

const EMPTY_RAW: RawStatistics = { summary: { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 }, distribution: [], firstGuesses: [], perDay: [], hardestPuzzles: [] };

/** Start of today's in-progress puzzle (ms). Games finishing before this are completed. */
export async function getStatsBoundaryMs(dataset: Dataset): Promise<number | null> {
	const answer = await getCurrentAnswer(dataset);
	if (!answer) return null;
	return new Date(answer.nextReset).getTime() - GAME_CONFIG.nextResetHours * HOUR_MS;
}

/** Total games ever logged across every dataset/mode. Uses collection metadata (O(1)). */
export async function getGlobalGamesPlayed(): Promise<number> {
	return gameLogCollection.estimatedDocumentCount();
}

/** Run all statistics aggregation for a dataset over [fromMs, toMs). */
export async function getRawStatistics(dataset: Dataset, fromMs: number, toMs: number): Promise<RawStatistics> {
	if (fromMs >= toMs) return EMPTY_RAW;

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
					perDay: [
						{
							$group: {
								_id: { $dateToString: { format: '%Y-%m-%d', date: '$finishedAt', timezone: 'UTC' } },
								played: { $sum: 1 },
								wins: { $sum: cond(isWon) },
							},
						},
						{ $sort: { _id: 1 } },
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
		perDay: (agg?.perDay ?? []).map((d: { _id: string; played: number; wins: number }) => ({ date: d._id, played: d.played, wins: d.wins })),
		hardestPuzzles,
	};
}
