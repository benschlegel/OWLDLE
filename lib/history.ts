import type { Dataset } from '@/data/datasets';
import type { RawHistoryDetail, RawHistoryEntry } from '@/lib/database/history';
import type { HistoryDetailResponse, HistoryListResponse } from '@/types/history';

/** Win-rate as a 0–100 integer. Mirrors `pct` in lib/statistics.ts. */
function pct(n: number, d: number): number {
	return d > 0 ? Math.round((n / d) * 100) : 0;
}

/** Shape raw history rows into the list response. Pure. Input is already iteration-desc. */
export function shapeHistoryList(dataset: Dataset, raw: RawHistoryEntry[], nextCursor: number | null): HistoryListResponse {
	return {
		dataset,
		entries: raw.map((r) => ({
			iteration: r.iteration,
			date: r.date.toISOString(),
			player: r.player,
			played: r.played,
			winRate: pct(r.wins, r.played),
		})),
		nextCursor,
	};
}

/** Shape raw puzzle detail into the detail response. Pure. `maxGuesses` from GAME_CONFIG. */
export function shapeHistoryDetail(dataset: Dataset, raw: RawHistoryDetail, maxGuesses: number): HistoryDetailResponse {
	const { gamesPlayed, wins, winGuessSum, solvedFirst } = raw.summary;
	const distMap = new Map(raw.distribution.map((d) => [d.bucket, d.count]));
	const guessDistribution: HistoryDetailResponse['guessDistribution'] = [];
	for (let i = 1; i <= maxGuesses; i++) guessDistribution.push({ bucket: String(i), count: distMap.get(String(i)) ?? 0 });
	guessDistribution.push({ bucket: 'failed', count: distMap.get('failed') ?? 0 });

	return {
		dataset,
		iteration: raw.iteration,
		date: raw.date.toISOString(),
		player: raw.player,
		summary: {
			gamesPlayed,
			wins,
			losses: gamesPlayed - wins,
			winRate: pct(wins, gamesPlayed),
			averageGuesses: wins > 0 ? Math.round((winGuessSum / wins) * 10) / 10 : null,
			solvedFirstGuessRate: pct(solvedFirst, gamesPlayed),
		},
		guessDistribution,
	};
}
