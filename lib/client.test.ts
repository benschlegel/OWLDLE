import { type FormatConfig, formatResult } from '@/lib/client';
import type { GuessResponse } from '@/types/server';
import { test, expect, describe } from 'bun:test';

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

const FORMAT_CONFIG_WON_4: FormatConfig = { guesses: WON_GUESSES_4, gameIteration: 1, gameName: 'TEST_NAME', maxGuesses: 8, siteUrlShorthand: 'test.url.com' };

const FORMAT_CONFIG_LOST_8: FormatConfig = { guesses: LOST_GUESSES_8, gameIteration: 2, gameName: 'NAME', maxGuesses: 8, siteUrlShorthand: 'my.url.com' };

const FORMAT_CONFIG_WON_8: FormatConfig = {
	guesses: WON_GUESSES_8,
	gameIteration: 3,
	gameName: 'COOL_GAME',
	maxGuesses: 8,
	siteUrlShorthand: 'another.url.com',
};

describe('game result', () => {
	test('header correct', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_4);
		expect(formattedResult).toStartWith(
			`${FORMAT_CONFIG_WON_4.gameName} ${FORMAT_CONFIG_WON_4.gameIteration} ${FORMAT_CONFIG_WON_4.guesses.length}/${FORMAT_CONFIG_WON_4.maxGuesses}\n`
		);
	});
	test('footer correct', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_4);
		expect(formattedResult).toEndWith(FORMAT_CONFIG_WON_4.siteUrlShorthand);
	});
	test('won after 4 guesses', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_4);
		const expectedString = getExpectedString(FORMAT_CONFIG_WON_4, '🟩🟥🟥🟥\n🟩🟩🟥🟥\n🟩🟩🟩🟥\n🟩🟩🟩🟩✅');
		expect(formattedResult).toBe(expectedString);
	});
	test('won after 8 guesses', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_WON_8);
		const expectedString = getExpectedString(FORMAT_CONFIG_WON_8, '🟩🟥🟥🟥\n🟩🟩🟥🟥\n🟩🟩🟩🟥\n🟩🟩🟩🟩✅');
		expect(formattedResult).toBe(expectedString);
	});
	test('lost after 8 guesses', () => {
		const formattedResult = formatResult(FORMAT_CONFIG_LOST_8);
		const expectedString = getExpectedString(FORMAT_CONFIG_LOST_8, '🟩🟥🟥🟥\n🟩🟥🟥🟥\n🟩🟩🟩🟥\n🟩🟥🟩🟩\n🟥🟥🟩🟩\n🟩🟥🟩🟩\n🟩🟥🟥🟩\n🟩🟥🟩🟩❌');
		expect(formattedResult).toBe(expectedString);
	});
});

function getExpectedString(config: FormatConfig, content: string) {
	return `${config.gameName} ${config.gameIteration} ${config.guesses.length}/${config.maxGuesses}\n${content}\n${config.siteUrlShorthand}`;
}
