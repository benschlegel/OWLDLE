import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';

type FormatConfig = {
	/**
	 * What guesses a player made
	 */
	guesses: GuessResponse[];
	/**
	 *  The number of the current iteration of the game (e.g. 3 on the third day)
	 */
	gameIteration: number;
};

/**
 * Formats the result of a game with emojis to show the the progression.
 * @param config The config to ge for formatting (more info can be found in FormatConfig type)
 * @returns a string formatted using emojis (🟥 🟩) + stats
 */
export function formatResult({ guesses, gameIteration }: FormatConfig): string {
	// TODO: add X to header if game was not completed successfully
	// Add header
	let result = `${GAME_CONFIG.gameName} ${gameIteration} ${guesses}/${GAME_CONFIG.maxGuesses}`;

	// Format every guess to emoji row
	for (const guess of guesses) {
		result += `${getEmojRow(guess)}\n`;
	}

	// Add ❌ to last row if game was not completed successfully
	const hasFailed = guesses[GAME_CONFIG.maxGuesses - 1].isNameCorrect;
	if (hasFailed) result += '❌';

	// Add footer (with site url)
	result += `\n${GAME_CONFIG.siteUrlShorthand}`;
	return result;
}

/**
 * Formats row of a guess (e.g. 🟥🟩🟥🟥)
 * @param guess guess to format
 * @returns row formatted as a string with emojis corresponding to current guess
 */
function getEmojRow(guess: GuessResponse) {
	// Check special cases (if row is correct and game is won)
	if (guess.isNameCorrect) {
		return '🟩🟩🟩🟩✅';
	}

	// The global order for what column corresponds to what emoji
	const guessOrder = [guess.isCountryCorrect, guess.isRoleCorrect, guess.isRegionCorrect, guess.isTeamCorrect];

	// Contains formatted string
	let row = '';

	// Format entire row based on each entry
	for (const isGuessCorrect of guessOrder) {
		row += getEmojiCell(isGuessCorrect);
	}
	return row;
}

/**
 * Formats guess with emoji (true => 🟩, false => 🟥)
 * @param guess wether the guess was correct or not
 * @returns corresponding emoji for guess
 */
function getEmojiCell(isCorrect: boolean) {
	return isCorrect ? '🟩' : '🟥';
}
