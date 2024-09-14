import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';

type FormatConfig = {
	/**
	 * What guesses a player made
	 */
	guesses: GuessResponse[];
	/**
	 * How many guesses a player can make before the game ends
	 */
	maxGuesses: number;
	/**
	 *  The number of the current iteration of the game (e.g. 3 on the third day)
	 */
	gameIteration: number;
};

/**
 * Formats the result of a game with emojis to show the the progression.
 * @param config The config to use for formatting (more info can be found in FormatConfig type)
 * @returns a string formatted using emojis (🟥 🟩) + stats
 */
export function formatResult({ guesses, maxGuesses, gameIteration }: FormatConfig): string {
	console.log('Temp', GAME_CONFIG.maxGuesses);
	return '';
}
