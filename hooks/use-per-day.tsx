import type { DayCounts, DayPoint, DayScope, PerDayResponse, TimeframeRange } from '@/types/statistics';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type Params = { dataset: string; range: TimeframeRange; from: string | null; to: string | null; scope: DayScope; stage?: string };

async function fetchPerDay({ dataset, range, from, to, scope, stage }: Params): Promise<PerDayResponse> {
	const sp = new URLSearchParams({ dataset, range, scope });
	if (range === 'custom' && from && to) {
		sp.set('from', from);
		sp.set('to', to);
	}
	if (stage && stage !== 'all') sp.set('stage', stage);
	const res = await fetch(`/api/statistics/perday?${sp.toString()}`);
	if (!res.ok) throw new Error('Failed to load per-day statistics');
	return res.json();
}

/** Per-day series for a dataset/timeframe/scope. Shares its cache key shape with the chart so the
 *  avg-guesses card and the games-per-day chart (both scope 'current') dedupe to one request. */
export function usePerDay(params: Params) {
	return useQuery({
		queryKey: ['perday', params.dataset, params.range, params.from, params.to, params.scope, params.stage ?? 'all'],
		queryFn: () => fetchPerDay(params),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
}

// ---- Client-side grouping + metric helpers ------------------------------------------------

export type DayBucket = DayCounts & {
	/** ISO key for the bucket start (YYYY-MM-DD); used as the chart x value. */
	date: string;
	/** Only set for day buckets of a single-dataset series. */
	answer?: string;
	/** Per-dataset ("mode") split — only present for an all-modes series. */
	breakdown?: ({ dataset: string } & DayCounts)[];
};

/** Monday-based UTC week start for a YYYY-MM-DD date. */
function weekStart(date: string): string {
	const d = new Date(`${date}T00:00:00.000Z`);
	const day = (d.getUTCDay() + 6) % 7; // 0 = Monday
	d.setUTCDate(d.getUTCDate() - day);
	return d.toISOString().slice(0, 10);
}

/** Merge a per-mode breakdown into an accumulating map (keyed by dataset). */
function mergeBreakdown(into: Map<string, { dataset: string } & DayCounts>, from?: ({ dataset: string } & DayCounts)[]) {
	if (!from) return;
	for (const e of from) {
		const existing = into.get(e.dataset);
		if (existing) {
			existing.played += e.played;
			existing.wins += e.wins;
			existing.totalGuesses += e.totalGuesses;
			existing.winGuessSum += e.winGuessSum;
		} else {
			into.set(e.dataset, { ...e });
		}
	}
}

/** Aggregate daily points into the requested granularity (summing raw counts and any per-mode breakdown). */
export function groupDayPoints(points: DayPoint[], grouping: 'days' | 'weeks' | 'months'): DayBucket[] {
	if (grouping === 'days') {
		return points.map((p) => ({ ...p }));
	}
	const keyOf = grouping === 'weeks' ? weekStart : (date: string) => `${date.slice(0, 7)}-01`;
	const map = new Map<string, DayBucket>();
	const breakdowns = new Map<string, Map<string, { dataset: string } & DayCounts>>();
	for (const p of points) {
		const key = keyOf(p.date);
		let b = map.get(key);
		if (!b) {
			b = { date: key, played: 0, wins: 0, totalGuesses: 0, winGuessSum: 0 };
			map.set(key, b);
			breakdowns.set(key, new Map());
		}
		b.played += p.played;
		b.wins += p.wins;
		b.totalGuesses += p.totalGuesses;
		b.winGuessSum += p.winGuessSum;
		if (p.breakdown) mergeBreakdown(breakdowns.get(key) as Map<string, { dataset: string } & DayCounts>, p.breakdown);
	}
	for (const [key, b] of map) {
		const bd = breakdowns.get(key);
		if (bd && bd.size > 0) b.breakdown = [...bd.values()];
	}
	return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type DayMetricKey = 'played' | 'won' | 'totalGuesses' | 'avgGuesses' | 'winRate';

/** The metric value for one set of counts (null when undefined, e.g. avg guesses with no wins). */
export function metricValue(b: DayCounts, metric: DayMetricKey): number | null {
	switch (metric) {
		case 'played':
			return b.played;
		case 'won':
			return b.wins;
		case 'totalGuesses':
			return b.totalGuesses;
		case 'avgGuesses':
			return b.wins > 0 ? Math.round((b.winGuessSum / b.wins) * 10) / 10 : null;
		case 'winRate':
			return b.played > 0 ? Math.round((b.wins / b.played) * 100) : 0;
	}
}

/** The metric total over the whole (ungrouped) timeframe, for the chart tabs. */
export function metricTotal(points: DayPoint[], metric: DayMetricKey): number | null {
	const sum = points.reduce(
		(acc, p) => {
			acc.played += p.played;
			acc.wins += p.wins;
			acc.totalGuesses += p.totalGuesses;
			acc.winGuessSum += p.winGuessSum;
			return acc;
		},
		{ played: 0, wins: 0, totalGuesses: 0, winGuessSum: 0 }
	);
	switch (metric) {
		case 'played':
			return sum.played;
		case 'won':
			return sum.wins;
		case 'totalGuesses':
			return sum.totalGuesses;
		case 'avgGuesses':
			return sum.wins > 0 ? Math.round((sum.winGuessSum / sum.wins) * 10) / 10 : null;
		case 'winRate':
			return sum.played > 0 ? Math.round((sum.wins / sum.played) * 100) : 0;
	}
}
