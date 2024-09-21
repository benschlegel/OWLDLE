import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { type Feedback, GuessSchema } from '@/types/server';
import { z } from 'zod';

export type DbDatasetID = 'OWL_season1' | 'OWL_season2';
export type DbAnswerPrefix = 'current' | 'next';

export type AnswerKey = `${DbAnswerPrefix}_${DbDatasetID}`;

export type DbAnswer = Omit<DbAnswerFull, '_id'>;
export type DbPlayer = Omit<FormattedPlayer, 'countryImg'>;

export type DbLogEntryKey = `games_${DbDatasetID}`;

export type DbFormattedPlayers = {
	/**
	 * which season players are from
	 */
	_id: DbDatasetID;
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
	dataset: DbDatasetID;
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
	dataset: DbDatasetID;
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

/**
 * Feedback schema + timestamp
 */
export type DbFeedback = Feedback & { timestamp: Date };

export type DbSaveData = z.infer<typeof gameSaveValidator>;
export type DbGuess = DbSaveData['gameData'][number];
export type DbGameResult = DbSaveData['gameResult'];
