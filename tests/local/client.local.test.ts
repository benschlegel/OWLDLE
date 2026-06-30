import { describe, expect, test } from 'vitest';
import { type FormatConfig, formatResult } from '@/lib/client';
import type { GuessResponse } from '@/types/server';

const WON_GUESSES_4: GuessResponse[] = [
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: true, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: true },
];

const LOST_GUESSES_8: GuessResponse[] = [
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: true, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: false, isRoleCorrect: false, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: false },
];

const WON_GUESSES_8: GuessResponse[] = [
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: true, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: false, isRoleCorrect: false, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: false, isRoleCorrect: false, isRegionCorrect: false, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: false, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: false, isTeamCorrect: false, isNameCorrect: false },
	{ isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: true },
];

const FORMAT_CONFIG_WON_4: FormatConfig = {
	guesses: WON_GUESSES_4,
	dataset: 'season1',
	gameIteration: 1,
	gameName: 'TEST_NAME',
	maxGuesses: 8,
	siteUrl: 'test.url.com/',
};

const FORMAT_CONFIG_LOST_8: FormatConfig = {
	guesses: LOST_GUESSES_8,
	dataset: 'season6',
	gameIteration: 2,
	gameName: 'NAME',
	maxGuesses: 8,
	siteUrl: 'my.url.com/',
};

const FORMAT_CONFIG_WON_8: FormatConfig = {
	guesses: WON_GUESSES_8,
	dataset: 'season3',
	gameIteration: 3,
	gameName: 'COOL_GAME',
	maxGuesses: 8,
	siteUrl: 'another.url.com/',
};

describe.todo('game result', () => {
	test('header correct', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_4);
		// TODO: also use getExpectedString here
		const expectedHeader = `${FORMAT_CONFIG_WON_4.gameName} ${FORMAT_CONFIG_WON_4.gameIteration} ${FORMAT_CONFIG_WON_4.guesses.length}/${FORMAT_CONFIG_WON_4.maxGuesses} [Season 1]\n`;
		expect(formattedResult).toContain(expectedHeader);
	});
	test('footer correct', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_4);
		expect(formattedResult).toContain(FORMAT_CONFIG_WON_4.siteUrl);
	});
	test('won after 4/8 guesses', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_4);
		const expectedString = getExpectedString(FORMAT_CONFIG_WON_4, '🟩🟥🟥🟥\n🟩🟩🟥🟥\n🟩🟩🟩🟥\n🟩🟩🟩🟩✅');
		expect(formattedResult).toBe(expectedString);
	});
	test('won after 8/8 guesses', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_8);
		const expectedString = getExpectedString(FORMAT_CONFIG_WON_8, '🟩🟥🟥🟥\n🟩🟥🟥🟥\n🟩🟩🟩🟥\n🟥🟥🟩🟩\n🟥🟥🟥🟩\n🟩🟥🟩🟩\n🟩🟩🟥🟥\n🟩🟩🟩🟩✅');
		expect(formattedResult).toBe(expectedString);
	});
	test('lost after 8/8 guesses', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_LOST_8);
		const expectedString = getExpectedString(FORMAT_CONFIG_LOST_8, '🟩🟥🟥🟥\n🟩🟥🟥🟥\n🟩🟩🟩🟥\n🟩🟥🟩🟩\n🟥🟥🟩🟩\n🟩🟥🟩🟩\n🟩🟥🟥🟩\n🟩🟥🟩🟩❌');
		expect(formattedResult).toBe(expectedString);
	});
});

// describe('format correct for all datasets', () => {
// 	test.concurrent.each(DATASETS)('lost after 8/8 guesses (%s)', async (dataset) => {
// 		const config = { ...FORMAT_CONFIG_LOST_8, dataset: dataset };
// 		const formattedResult = formatResult(config);
// 		const expectedString = getExpectedString(config, '🟩🟥🟥🟥\n🟩🟥🟥🟥\n🟩🟩🟩🟥\n🟩🟥🟩🟩\n🟥🟥🟩🟩\n🟩🟥🟩🟩\n🟩🟥🟥🟩\n🟩🟥🟩🟩❌');
// 		expect(formattedResult).toBe(expectedString);
// 	});
// 	test.concurrent.each(DATASETS)('won after 8/8 guesses (%s)', async (dataset) => {
// 		const config = { ...FORMAT_CONFIG_WON_8, dataset: dataset };
// 		const formattedResult = formatResult(config);
// 		const expectedString = getExpectedString(config, '🟩🟥🟥🟥\n🟩🟥🟥🟥\n🟩🟩🟩🟥\n🟥🟥🟩🟩\n🟥🟥🟥🟩\n🟩🟥🟩🟩\n🟩🟩🟥🟥\n🟩🟩🟩🟩✅');
// 		expect(formattedResult).toBe(expectedString);
// 	});
// });

describe('age comparison emoji (OWCS)', () => {
	// base: country wrong, role correct, region wrong, team wrong — a typical non-winning guess
	const base: GuessResponse = {
		isCountryCorrect: false,
		isRoleCorrect: true,
		isRegionCorrect: false,
		isTeamCorrect: false,
		isNameCorrect: false,
	};
	const WIN: GuessResponse = { isCountryCorrect: true, isRoleCorrect: true, isRegionCorrect: true, isTeamCorrect: true, isNameCorrect: true };
	// Two-guess configs: first guess = case under test, second = winning guess.
	// This keeps the first row free of the trailing ❌ that formatResult appends on the last row of a lost game.
	const owcsConfig = (guess: GuessResponse): FormatConfig => ({
		guesses: [guess, WIN],
		gameIteration: 1,
		gameName: 'TEST',
		maxGuesses: 8,
		siteUrl: 'test.com/',
		dataset: 'owcs-s3',
	});
	const nonOwcsConfig = (guess: GuessResponse): FormatConfig => ({
		guesses: [guess, WIN],
		gameIteration: 1,
		gameName: 'TEST',
		maxGuesses: 8,
		siteUrl: 'test.com/',
		dataset: 'season1',
	});
	// First guess row is always split('\n')[1]; the winning row follows at [2].
	const firstRow = (result: string) => result.split('\n')[1];

	test('equal age → 🟩 appended for OWCS', () => {
		expect(firstRow(formatResult(owcsConfig({ ...base, ageComparison: 'equal' })))).toBe('🟥🟩🟥🟥🟩');
	});

	test('higher age → 🟧 appended for OWCS', () => {
		expect(firstRow(formatResult(owcsConfig({ ...base, ageComparison: 'higher' })))).toBe('🟥🟩🟥🟥🟧');
	});

	test('lower age → 🟧 appended for OWCS', () => {
		expect(firstRow(formatResult(owcsConfig({ ...base, ageComparison: 'lower' })))).toBe('🟥🟩🟥🟥🟧');
	});

	test('unknown age → ❓ appended for OWCS', () => {
		expect(firstRow(formatResult(owcsConfig({ ...base })))).toBe('🟥🟩🟥🟥❓');
	});

	test('no age column for non-OWCS dataset', () => {
		expect(firstRow(formatResult(nonOwcsConfig({ ...base, ageComparison: 'equal' })))).toBe('🟥🟩🟥🟥');
	});

	test('winning row for OWCS has 5 🟩 + ✅', () => {
		const row = formatResult(owcsConfig({ ...base, isNameCorrect: true })).split('\n')[1];
		expect(row).toBe('🟩🟩🟩🟩🟩✅');
	});

	test('winning row for non-OWCS has 4 🟩 + ✅', () => {
		const row = formatResult(nonOwcsConfig({ ...base, isNameCorrect: true })).split('\n')[1];
		expect(row).toBe('🟩🟩🟩🟩✅');
	});
});

describe('partial role emoji', () => {
	test('roleMatch partial produces 🟧 in share row', () => {
		const guess: GuessResponse = {
			isCountryCorrect: true,
			isRoleCorrect: true,
			isRegionCorrect: false,
			isTeamCorrect: false,
			isNameCorrect: false,
			roleMatch: 'partial',
		};
		const config: FormatConfig = {
			guesses: [guess],
			gameIteration: 1,
			gameName: 'TEST',
			maxGuesses: 8,
			siteUrl: 'test.com/',
			dataset: 'season1',
		};
		const result = formatResult(config);
		expect(result).toContain('🟧');
	});
});

function getExpectedString(config: FormatConfig, content: string) {
	const datasetPostfix = config.dataset ?? '';
	const seasonText =
		config.dataset !== undefined
			? config.dataset === 'owcs-s2'
				? 'OWCS S2'
				: `${config.dataset.charAt(0).toUpperCase()}${config.dataset.slice(1, -1)} ${config.dataset.slice(-1)}`
			: '';
	return `${config.gameName} ${config.gameIteration} ${config.guesses.length}/${config.maxGuesses} [${seasonText}]\n${content}\n<${config.siteUrl}${config.dataset?.startsWith('owcs') ? 'owcs' : datasetPostfix}>`;
}
