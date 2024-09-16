import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import type { GuessResponse } from '@/types/server';

export type FormatConfig = {
	/**
	 * What guesses a player made
	 */
	guesses: GuessResponse[];
	/**
	 * Maximum allowed guesses before game is over
	 */
	maxGuesses: number;
	/**
	 * Shorthand for footer (should be passed from game config value)
	 */
	siteUrlShorthand: string;
	/**
	 * Game name for footer (should be passed from game config value)
	 */
	gameName: string;
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
export function formatResult({ guesses, gameIteration, maxGuesses, gameName, siteUrlShorthand }: FormatConfig): string {
	// TODO: add X to header if game was not completed successfully
	// Add header
	let result = `${gameName} ${gameIteration} ${guesses.length}/${maxGuesses}\n`;

	// Format every guess to emoji row
	guesses.forEach((guess, index) => {
		result += getEmojRow(guess);
		if (index !== guesses.length - 1) {
			result += '\n';
		}
	});

	// Add ❌ to last row if game was not completed successfully
	const hasFailed = !guesses[guesses.length - 1].isNameCorrect;
	if (hasFailed === true) result += '❌';

	// Add footer (with site url)
	result += `\n${siteUrlShorthand}`;
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
