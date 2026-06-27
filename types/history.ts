import { z } from 'zod';
import { type Dataset, datasetSchema } from '@/data/datasets';
import type { GuessBucket } from '@/types/statistics';

export const historyQuerySchema = z.object({
	dataset: datasetSchema,
	cursor: z.coerce.number().int().positive().optional(),
	limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const historyDetailQuerySchema = z.object({
	dataset: datasetSchema,
	iteration: z.coerce.number().int().nonnegative(),
});
export type HistoryDetailQuery = z.infer<typeof historyDetailQuerySchema>;

/** One past puzzle in the history list (yesterday and earlier, never today). */
export type HistoryEntry = {
	iteration: number;
	date: string; // iteration's resetAt
	player: string; // answer player name
	played: number; // games completed that day
	winRate: number; // 0–100, integer (0 when played === 0)
};

export type HistoryListResponse = {
	dataset: Dataset;
	entries: HistoryEntry[]; // iteration DESC (latest / yesterday first)
	nextCursor: number | null; // null = no more pages
};

export type HistoryDetailResponse = {
	dataset: Dataset;
	iteration: number;
	date: string; // ISO 8601
	player: string;
	summary: {
		gamesPlayed: number;
		wins: number;
		losses: number;
		winRate: number; // 0–100, integer
		averageGuesses: number | null; // avg guesses among wins, 1 decimal, null if no wins
		solvedFirstGuessRate: number; // 0–100, integer
	};
	guessDistribution: GuessBucket[]; // ordered '1'..maxGuesses then 'failed', every bucket present
};
