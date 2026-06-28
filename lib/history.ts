import type { Dataset } from '@/data/datasets';
import type { RawHistoryDetail, RawHistoryEntry } from '@/lib/database/history';
import type { HistoryDetailResponse, HistoryListResponse } from '@/types/history';
import type { StageOption } from '@/types/statistics';

/** Win-rate as a 0–100 integer. Mirrors `pct` in lib/statistics.ts. */
function pct(n: number, d: number): number {
	return d > 0 ? Math.round((n / d) * 100) : 0;
}

/** Stage value/label/number for a game_logs key, given the resolved stage options. */
function stageMetaForKey(key: string, stages: StageOption[]): { stage: string; stageLabel: string; stageNumber: number } {
	const m = key.match(/-stage(\d+)$/);
	if (m) {
		const n = Number(m[1]);
		const opt = stages.find((s) => s.value === String(n));
		return { stage: String(n), stageLabel: opt?.label ?? `Stage ${n}`, stageNumber: n };
	}
	// Bare base key = live/current stage.
	const opt = stages.find((s) => s.value === 'current');
	const labelNum = opt?.label.match(/Stage (\d+)/);
	return { stage: 'current', stageLabel: opt?.label ?? 'Current', stageNumber: labelNum ? Number(labelNum[1]) : Number.MAX_SAFE_INTEGER };
}

/**
 * Shape raw history rows into the list response. Attaches per-entry stage metadata and
 * sorts by stageNumber DESC then iteration DESC (newest stage / newest puzzle first).
 */
export function shapeHistoryList(dataset: Dataset, raw: RawHistoryEntry[], stages: StageOption[]): HistoryListResponse {
	const entries = raw
		.map((r) => {
			const meta = stageMetaForKey(r.datasetKey, stages);
			return {
				iteration: r.iteration,
				date: r.date.toISOString(),
				player: r.player,
				played: r.played,
				winRate: pct(r.wins, r.played),
				datasetKey: r.datasetKey,
				...meta,
			};
		})
		.sort((a, b) => b.stageNumber - a.stageNumber || b.iteration - a.iteration);
	return { dataset, stages, entries };
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
