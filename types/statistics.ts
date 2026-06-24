import { z } from 'zod';
import { type Dataset, datasetSchema } from '@/data/datasets';

export const TIMEFRAME_RANGES = ['yesterday', 'last7', 'last30', 'all', 'custom'] as const;
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
export type DayPoint = { date: string; played: number; winRate: number };
export type HardPuzzle = { iteration: number; player: string; winRate: number; played: number };

export type StatisticsResponse = {
	dataset: Dataset;
	globalGamesPlayed: number; // total games ever logged across every dataset/mode (timeframe-independent)
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
	gamesPerDay: DayPoint[]; // date asc (YYYY-MM-DD)
	hardestPuzzles: HardPuzzle[]; // up to 20, winRate asc; may be empty
};
