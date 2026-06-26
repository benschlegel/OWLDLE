import { z } from 'zod';
import { type Dataset, datasetSchema } from '@/data/datasets';

export const TIMEFRAME_RANGES = ['yesterday', 'last7', 'last30', 'last90', 'lastYear', 'all', 'custom'] as const;
export type TimeframeRange = (typeof TIMEFRAME_RANGES)[number];

/** YYYY-MM-DD */
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const statisticsQuerySchema = z
	.object({
		dataset: datasetSchema,
		range: z.enum(TIMEFRAME_RANGES).default('yesterday'),
		from: dateStringSchema.optional(),
		to: dateStringSchema.optional(),
	})
	.refine((v) => v.range !== 'custom' || (v.from !== undefined && v.to !== undefined), {
		message: 'custom range requires from and to',
	});

export type StatisticsQuery = z.infer<typeof statisticsQuerySchema>;

export type GuessBucket = { bucket: string; count: number };
export type NamedCount = { name: string; count: number };
export type TeamCount = { team: string; count: number };

/** Grouping granularity for the per-day series. */
export const DAY_GROUPINGS = ['days', 'weeks', 'months'] as const;
export type DayGrouping = (typeof DAY_GROUPINGS)[number];

/** Whether the per-day series covers the selected dataset or every dataset summed together. */
export const DAY_SCOPES = ['current', 'all'] as const;
export type DayScope = (typeof DAY_SCOPES)[number];

/** Metrics selectable in the per-day chart tabs. */
export const DAY_METRICS = ['played', 'won', 'totalGuesses', 'avgGuesses', 'winRate'] as const;
export type DayMetric = (typeof DAY_METRICS)[number];

/** Raw per-day building blocks; the client derives metrics (winRate, avgGuesses, …) and can
 *  re-aggregate them into weeks/months. `answer` (the day's puzzle player) is only present for a
 *  single-dataset series. */
/** Raw counts for a single (day, dataset) cell — also the per-mode breakdown entry. */
export type DayCounts = {
	played: number;
	wins: number;
	totalGuesses: number; // sum of guesses across all games
	winGuessSum: number; // sum of guesses among wins (for avg-guesses aggregation)
};

export type DayPoint = DayCounts & {
	date: string; // YYYY-MM-DD (UTC)
	answer?: string; // the day's answer player name (single-dataset only)
	/** Per-dataset ("mode") split — only present for an all-modes series, for tooltips. */
	breakdown?: ({ dataset: string } & DayCounts)[];
};
export type HardPuzzle = { iteration: number; player: string; winRate: number; played: number };

export type StatisticsResponse = {
	dataset: Dataset;
	timeframe: { range: TimeframeRange; fromIso: string; toIso: string; label: string };
	summary: {
		gamesPlayed: number;
		wins: number;
		losses: number;
		winRate: number; // 0–100, integer
		averageGuesses: number | null; // mean guesses among wins, 1 decimal; null if no wins
		solvedFirstGuessRate: number; // 0–100, integer; share of all games won in exactly 1 guess
	};
	guessDistribution: GuessBucket[]; // ordered: '1'..maxGuesses then 'failed'; every bucket present
	topFirstGuesses: NamedCount[]; // up to 50, count desc
	topFirstTeams: TeamCount[]; // up to 50, count desc
	hardestPuzzles: HardPuzzle[]; // up to 20, winRate asc; may be empty
};

/** Response of the per-day endpoint (its own request so the chart can re-fetch on scope change). */
export type PerDayResponse = {
	dataset: Dataset;
	scope: DayScope;
	timeframe: { range: TimeframeRange; fromIso: string; toIso: string; label: string };
	perDay: DayPoint[]; // date asc (YYYY-MM-DD)
};
