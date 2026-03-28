import { type Dataset, datasetInfo } from '@/data/datasets';
import { customCountryNames, type CountryCode } from '@/types/countries';
import type { GuessResponse, ValidateResponse } from '@/types/server';

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
	siteUrl?: string;
	/**
	 * Game name for footer (should be passed from game config value)
	 */
	gameName: string;
	/**
	 *  The number of the current iteration of the game (e.g. 3 on the third day)
	 */
	gameIteration: number;
	/**
	 * What dataset the result is from (gets appended to url, e.g. www.owldle.com/season2, if dataset is season2)
	 */
	dataset?: Dataset;
};

/**
 * Formats the result of a game with emojis to show the the progression.
 * @param config The config to ge for formatting (more info can be found in FormatConfig type)
 * @returns a string formatted using emojis (🟥 🟩) + stats
 */
export function formatResult({ guesses, gameIteration, maxGuesses, gameName, siteUrl, dataset }: FormatConfig): string {
	const meta = dataset ? datasetInfo.find((d) => d.dataset === dataset) : undefined;
	const datasetPostfix = meta?.prettyHref ?? '';
	const seasonText = meta?.name ?? '';

	if (guesses.length === 0 || guesses === undefined) return '';
	// Add header
	let result = `${gameName} ${gameIteration} ${guesses.length}/${maxGuesses} [${seasonText}]\n`;

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
	const base = siteUrl?.replace(/\/$/, '') ?? getSiteName();
	result += `\n<${base}${datasetPostfix}>`;
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

/**
 * Dynamically get the site base name (e.g. https://www.test.com)
 */
export function getSiteName() {
	return `${window.location.protocol}//${window.location.host}`;
}

export const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

/**
 * Safely resolves a country code to a display name.
 * Falls back to `customCountryNames` for non-standard codes (e.g. subdivision codes like 'GB-WLS')
 */
export function getCountryDisplayName(code: string | undefined): string | undefined {
	if (!code) return undefined;
	try {
		return regionNames.of(code);
	} catch {
		return customCountryNames[code as CountryCode];
	}
}

/**
 * Splits a string by capitalization (e.g. LosAngelesGladiators => 'Los Angeles Gladiators')
 */
export function splitCapitalization(teamName: string) {
	return teamName.replace(/([A-Z])/g, ' $1').trim();
}

export async function fetchAnswer(dataset: Dataset): Promise<ValidateResponse> {
	const response = await fetch(`/api/validate?${dataset}`);
	if (!response.ok) {
		throw new Error('Could not fetch answer from server.');
	}
	return response.json();
}

export function formatDataset(dataset: string) {
	return `${dataset.charAt(0).toUpperCase() + dataset.slice(1, -1)} ${dataset.slice(-1)}`;
}
