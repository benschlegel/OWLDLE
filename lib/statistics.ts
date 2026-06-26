import type { Dataset } from '@/data/datasets';
import type { RawOverview, RawStatistics } from '@/lib/database/statistics';
import { OVERVIEW_ROLES } from '@/types/statistics';
import type { OverviewMode, OverviewResponse, OverviewRole, StatisticsResponse, TimeframeRange } from '@/types/statistics';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

function pct(n: number, d: number): number {
	return d > 0 ? Math.round((n / d) * 100) : 0;
}

/** Keep the first entry per player (the input is hardest-first, so this keeps each player's hardest puzzle). */
function dedupeByPlayer(puzzles: RawStatistics['hardestPuzzles']): RawStatistics['hardestPuzzles'] {
	const seen = new Set<string>();
	return puzzles.filter((p) => {
		if (seen.has(p.player)) return false;
		seen.add(p.player);
		return true;
	});
}

/** "Jun 1 – Jun 22" for the custom-range label. UTC to match server parsing. */
function formatRangeLabel(from: string, to: string): string {
	const fmt = (s: string) => new Date(`${s}T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
	return `${fmt(from)} - ${fmt(to)}`;
}

/**
 * Resolve a requested range to an absolute [fromMs, toMs) window. Presets are
 * anchored to `boundaryMs` (start of today's in-progress puzzle) so today is
 * always excluded. Custom ranges use UTC calendar days and are clamped to the
 * boundary so a user can never request today/future (no spoilers).
 */
export function resolveTimeframe(
	range: TimeframeRange,
	from: string | undefined,
	to: string | undefined,
	boundaryMs: number,
	nextResetHours: number
): { fromMs: number; toMs: number; label: string } {
	switch (range) {
		case 'yesterday':
			return { fromMs: boundaryMs - nextResetHours * HOUR_MS, toMs: boundaryMs, label: 'Yesterday' };
		case 'last7':
			return { fromMs: boundaryMs - 7 * DAY_MS, toMs: boundaryMs, label: 'Last 7 days' };
		case 'last30':
			return { fromMs: boundaryMs - 30 * DAY_MS, toMs: boundaryMs, label: 'Last 30 days' };
		case 'last90':
			return { fromMs: boundaryMs - 90 * DAY_MS, toMs: boundaryMs, label: 'Last 90 days' };
		case 'lastYear':
			return { fromMs: boundaryMs - 365 * DAY_MS, toMs: boundaryMs, label: 'Last year' };
		case 'all':
			return { fromMs: 0, toMs: boundaryMs, label: 'All time' };
		case 'custom': {
			const fromMs = Date.parse(`${from}T00:00:00.000Z`);
			// inclusive end day → +1 day; clamp to boundary
			const toMs = Math.min(Date.parse(`${to}T00:00:00.000Z`) + DAY_MS, boundaryMs);
			return { fromMs, toMs, label: formatRangeLabel(from as string, to as string) };
		}
	}
}

/** Shape raw aggregation output into the API response. Pure. */
export function shapeStatistics(
	raw: RawStatistics,
	opts: {
		dataset: Dataset;
		timeframe: StatisticsResponse['timeframe'];
		idToTeam: Map<number, string>;
		maxGuesses: number;
	}
): StatisticsResponse {
	const { gamesPlayed, wins, winGuessSum, solvedFirst } = raw.summary;
	const losses = gamesPlayed - wins;

	// Guess distribution: every bucket present and ordered.
	const distMap = new Map(raw.distribution.map((d) => [d.bucket, d.count]));
	const guessDistribution: StatisticsResponse['guessDistribution'] = [];
	for (let i = 1; i <= opts.maxGuesses; i++) guessDistribution.push({ bucket: String(i), count: distMap.get(String(i)) ?? 0 });
	guessDistribution.push({ bucket: 'failed', count: distMap.get('failed') ?? 0 });

	// First-guess names (already count-desc from the DB). Up to 50 so the
	// expand-to-fullscreen dialog has a long, searchable list; the card previews
	// only the first few.
	const topFirstGuesses = raw.firstGuesses.slice(0, 50).map((g) => ({ name: g.name, count: g.count }));

	// First-guess teams: fold id → team and re-aggregate.
	const teamTotals = new Map<string, number>();
	for (const g of raw.firstGuesses) {
		const team = opts.idToTeam.get(g.id) ?? 'Unknown';
		teamTotals.set(team, (teamTotals.get(team) ?? 0) + g.count);
	}
	const topFirstTeams = [...teamTotals.entries()]
		.map(([team, count]) => ({ team, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 50);

	return {
		dataset: opts.dataset,
		timeframe: opts.timeframe,
		summary: {
			gamesPlayed,
			wins,
			losses,
			winRate: pct(wins, gamesPlayed),
			averageGuesses: wins > 0 ? Math.round((winGuessSum / wins) * 10) / 10 : null,
			solvedFirstGuessRate: pct(solvedFirst, gamesPlayed),
		},
		guessDistribution,
		topFirstGuesses,
		topFirstTeams,
		// The same player can be the answer on several days; the raw list is hardest-first, so keep
		// only each player's hardest puzzle to avoid duplicate names in the chart.
		hardestPuzzles: dedupeByPlayer(raw.hardestPuzzles).map((p) => ({
			iteration: p.iteration,
			player: p.player,
			played: p.played,
			winRate: pct(p.wins, p.played),
		})),
	};
}

/** Strip a "-stage<N>" suffix so logged stage datasets fold into their base dataset. */
export function baseDataset(dataset: string): string {
	return dataset.replace(/-stage\d+$/, '');
}

/**
 * Shape the raw overview aggregation into the API response. Pure — roster/metadata lookups are
 * passed in (keyed by BASE dataset), mirroring `shapeStatistics`'s `idToTeam`. Folds stage logs
 * into their base, derives weekday/hour/heatmap from `byWeekdayHour`, and resolves roles via
 * (base dataset, id).
 */
export function shapeOverview(
	raw: RawOverview,
	opts: {
		datasetMeta: Map<string, { label: string; shorthand: string; mode: OverviewMode }>;
		roleByDatasetId: Map<string, Map<number, OverviewRole>>;
	}
): OverviewResponse {
	const modeOf = (base: string): OverviewMode => opts.datasetMeta.get(base)?.mode ?? (base.startsWith('season') ? 'owl' : 'owcs');

	// byDataset — fold stages into base, sort played desc.
	const dsMap = new Map<string, { played: number; wins: number; winGuessSum: number }>();
	for (const r of raw.byDataset) {
		const base = baseDataset(r.dataset);
		const acc = dsMap.get(base) ?? { played: 0, wins: 0, winGuessSum: 0 };
		acc.played += r.played;
		acc.wins += r.wins;
		acc.winGuessSum += r.winGuessSum;
		dsMap.set(base, acc);
	}
	const byDataset = [...dsMap.entries()]
		.map(([base, c]) => {
			const meta = opts.datasetMeta.get(base);
			return {
				dataset: base,
				label: meta?.label ?? base,
				shorthand: meta?.shorthand ?? base,
				mode: modeOf(base),
				played: c.played,
				wins: c.wins,
				winRate: pct(c.wins, c.played),
				avgGuesses: c.wins > 0 ? Math.round((c.winGuessSum / c.wins) * 10) / 10 : null,
			};
		})
		.sort((a, b) => b.played - a.played);

	const totalGames = byDataset.reduce((s, d) => s + d.played, 0);

	// byWeekday (1..7) / byHour (0..23) / heatmap — all derived from byWeekdayHour.
	const byWeekday = Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, played: 0, owl: 0, owcs: 0 }));
	const byHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, played: 0, owl: 0, owcs: 0 }));
	const heatCells = new Map<string, { weekday: number; hour: number; played: number }>();
	for (const r of raw.byWeekdayHour) {
		const mode = modeOf(baseDataset(r.dataset));
		const w = byWeekday[r.weekday - 1];
		if (w) {
			w.played += r.played;
			w[mode] += r.played;
		}
		const h = byHour[r.hour];
		if (h) {
			h.played += r.played;
			h[mode] += r.played;
		}
		const key = `${r.weekday}-${r.hour}`;
		const cell = heatCells.get(key) ?? { weekday: r.weekday, hour: r.hour, played: 0 };
		cell.played += r.played;
		heatCells.set(key, cell);
	}

	// byRole — resolve role via (base dataset, id); skip unresolved/null ids.
	const roleTotals = new Map<OverviewRole, { first: number; all: number }>(OVERVIEW_ROLES.map((r) => [r, { first: 0, all: 0 }]));
	const fold = (rows: { dataset: string; id: number | null; count: number }[], key: 'first' | 'all') => {
		for (const r of rows) {
			if (r.id == null) continue;
			const role = opts.roleByDatasetId.get(baseDataset(r.dataset))?.get(r.id);
			if (!role) continue;
			const t = roleTotals.get(role);
			if (t) t[key] += r.count;
		}
	};
	fold(raw.firstRole, 'first');
	fold(raw.allRole, 'all');
	const byRole = OVERVIEW_ROLES.map((role) => {
		const t = roleTotals.get(role) ?? { first: 0, all: 0 };
		return { role, first: t.first, all: t.all };
	});

	return { totalGames, byDataset, byWeekday, byHour, heatmap: [...heatCells.values()], byRole };
}
