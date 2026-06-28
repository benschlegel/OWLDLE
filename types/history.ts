import { z } from 'zod';
import { type Dataset, datasetSchema } from '@/data/datasets';
import type { GuessResponse } from '@/types/server';
import type { GuessBucket, StageOption } from '@/types/statistics';

export const historyQuerySchema = z.object({
	dataset: datasetSchema,
});
export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const historyDetailQuerySchema = z.object({
	dataset: datasetSchema,
	iteration: z.coerce.number().int().nonnegative(),
	// Stage key suffix ('current' = live base, or an archived stage number). Defaults to the live base.
	stage: z.string().optional(),
});
export type HistoryDetailQuery = z.infer<typeof historyDetailQuerySchema>;

export const historyRandomQuerySchema = z.object({});
export type HistoryRandomQuery = z.infer<typeof historyRandomQuerySchema>;

/** One past puzzle in the history list (yesterday and earlier, never today). */
export type HistoryEntry = {
	iteration: number;
	date: string; // iteration's resetAt
	player: string; // answer player name
	played: number; // games completed that day
	winRate: number; // 0–100, integer (0 when played === 0)
	stage: string; // stage value: 'current' (live base) or '<N>' (archived)
	stageLabel: string; // e.g. 'Stage 3'
	stageNumber: number; // numeric stage for grouping/sorting (higher = newer)
	datasetKey: string; // game_logs `dataset` key this entry came from
};

export type HistoryListResponse = {
	dataset: Dataset;
	stages: StageOption[]; // available stages (for labels); 'all' option included when archives exist
	entries: HistoryEntry[]; // sorted stageNumber DESC, then iteration DESC
};

/** A guessed player in a replay, resolved against the game's own (stage-specific) roster. */
export type HistoryRandomPlayer = {
	name: string;
	country: string;
	role: string;
	region: string | null;
	team: string;
};

/** A single randomly-sampled past game (one player's playthrough) from any dataset. */
export type HistoryRandomGame = {
	datasetKey: string; // game_logs key it came from (may be an archived `-stageN`)
	iteration: number;
	gameResult: 'won' | 'lost';
	finishedAt: string;
	answer: string; // the correct player for that iteration
	guesses: { guessResult: GuessResponse; player: HistoryRandomPlayer }[];
};

export type HistoryDetailResponse = {
	dataset: Dataset;
	iteration: number;
	date: string;
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
