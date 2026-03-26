import type { Dataset } from '@/data/datasets';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { type Feedback, GuessSchema } from '@/types/server';
import { z } from 'zod';

export type DbAnswerPrefix = 'current' | 'next';

export type AnswerKey = `${DbAnswerPrefix}_${Dataset}`;

export type DbAnswer = Omit<DbAnswerFull, '_id'>;
export type DbPlayer = Omit<CombinedFormattedPlayer, 'countryImg' | 'regionImg'>;

export type DbLogEntryKey = `games_${Dataset}`;

export type DbFormattedPlayers = {
	/**
	 * which season players are from
	 */
	_id: Dataset;
	players: DbPlayer[];
};

export type DbAnswerFull = {
	/**
	 * Should always be hard coded
	 */
	_id: AnswerKey;
	/**
	 * The correct player
	 */
	player: DbPlayer;
	/**
	 * Time of next reset
	 */
	nextReset: Date;
	/**
	 * What iteration of the game this answer is for
	 */
	iteration: number;
};

export type DbIteration = {
	/**
	 * What dataset this iteration is for
	 */
	dataset: Dataset;
	/**
	 * The game iteration number
	 */
	iteration: DbAnswerFull['iteration'];
	/**
	 * What time this iteration was reset
	 */
	resetAt: Date;
	/**
	 * The correct player for this iteration
	 */
	player: DbPlayer;
};

export type DbLoggedGame = {
	/**
	 * What dataset this iteration is for
	 */
	dataset: Dataset;
	/**
	 * The game iteration number
	 */
	iteration: DbAnswerFull['iteration'];
	/**
	 * The data for this game (containing all guesses)
	 */
	gameData: DbGuess[];
	/**
	 * Result of this game (won or lost)
	 */
	gameResult: DbGameResult;
	/**
	 * Timestamp of when the game was finished
	 */
	finishedAt: Date;
};

const trimmedPlayer = z.object({ name: z.string(), id: z.number().min(0) });
export type DbTrimmedPlayer = z.infer<typeof trimmedPlayer>;
export const gameSaveValidator = z.object({
	gameData: z
		.array(
			z.object({
				guessResult: GuessSchema,
				player: trimmedPlayer,
			})
		)
		.min(1),
	gameResult: z.enum(['won', 'lost']),
});

export type DbEndlessGameEntry = {
	/** How many guesses were submitted in this game */
	guessCount: number;
	/** Whether this game was won or lost */
	result: DbGameResult;
};

export type DbLoggedEndlessSession = {
	/** What dataset this session is for */
	dataset: Dataset;
	/** Number of wins before the streak ended */
	streakLength: number;
	/** Simplified per-game summary for entire streak*/
	games: DbEndlessGameEntry[];
	/** Timestamp of when the streak ended (game was lost) */
	finishedAt: Date;
};

export const endlessSaveValidator = z.object({
	streakLength: z.number().min(1),
	games: z
		.array(
			z.object({
				guessCount: z.number().min(1),
				result: z.enum(['won', 'lost']),
			})
		)
		.min(1),
});
export type DbEndlessSaveData = z.infer<typeof endlessSaveValidator>;

/**
 * Feedback schema + timestamp
 */
export type DbFeedback = Feedback & { timestamp: Date };

export type DbSaveData = z.infer<typeof gameSaveValidator>;
export type DbGuess = DbSaveData['gameData'][number];
export type DbGameResult = DbSaveData['gameResult'];
