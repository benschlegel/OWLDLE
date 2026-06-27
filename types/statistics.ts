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
		stage: z.string().optional(),
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

/** One selectable entry in the stage dropdown. `value` is the query param: 'all' | 'current' | '<N>'. */
export type StageOption = { value: string; label: string };

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
	/** Stages selectable for this dataset. ≤1 entry ⇒ no archived stages (disable the selector). */
	stages: StageOption[];
	/** The resolved selected stage value: 'all' | 'current' | '<N>'. */
	stage: string;
};

/** Response of the per-day endpoint (its own request so the chart can re-fetch on scope change). */
export type PerDayResponse = {
	dataset: Dataset;
	scope: DayScope;
	timeframe: { range: TimeframeRange; fromIso: string; toIso: string; label: string };
	perDay: DayPoint[]; // date asc (YYYY-MM-DD)
};

/** "Mode": OWL (Overwatch League) vs. OWCS (Champion Series). Mirrors DatasetMode. */
export type OverviewMode = 'owl' | 'owcs';

/** Roles a guessed player can have (from the roster). */
export const OVERVIEW_ROLES = ['Tank', 'Damage', 'Support'] as const;
export type OverviewRole = (typeof OVERVIEW_ROLES)[number];

/** Response of the all-time, all-dataset overview endpoint. */
export type OverviewResponse = {
	/** Total games ever logged (sum of byDataset.played). */
	totalGames: number;
	/** Per base-dataset totals, played desc. Stage logs are folded into their base. */
	byDataset: {
		dataset: string; // base dataset id, e.g. 'owcs-s3'
		label: string; // e.g. 'OWCS S3 (2026)'
		shorthand: string; // e.g. 'S3'
		mode: OverviewMode;
		played: number;
		wins: number;
		winRate: number; // 0–100, integer
		avgGuesses: number | null; // mean guesses among wins, 1 decimal; null if no wins
	}[];
	/** Games per ISO weekday (1=Mon … 7=Sun). All 7 present; split by mode for tooltips. */
	byWeekday: { weekday: number; played: number; owl: number; owcs: number }[];
	/** Games per hour of day (0–23, UTC). All 24 present; split by mode for tooltips. */
	byHour: { hour: number; played: number; owl: number; owcs: number }[];
	/** Sparse weekday×hour grid for the activity heatmap (only populated cells). */
	heatmap: { weekday: number; hour: number; played: number }[];
	/** Per role: how often guessed FIRST vs. across ALL guesses. Fixed order Tank/Damage/Support. */
	byRole: { role: OverviewRole; first: number; all: number }[];
};
