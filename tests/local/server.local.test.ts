import { validateGuess } from '@/lib/server';
import { getAgeFromDate } from '@/lib/utils';
import { DbPlayer } from '@/types/database';
import type { Player } from '@/types/players';
import { test, expect, describe } from 'vitest';

// JJoNak (KR Support, NYXL, East)
const CORRECT_PLAYER_1: Player = { name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior', region: 'AtlanticDivison' };

// super (NA Tank, SFShock, West)
const CORRECT_PLAYER_2: Player = { name: 'super', country: 'US', role: 'Tank', team: 'SanFranciscoShock', region: 'PacificDivision' };

describe('validate guesses', () => {
	describe('correct guess', () => {
		test('all correct player1', () => {
			const result = validateGuess(CORRECT_PLAYER_1 as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: true, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
		test('all correct player2', () => {
			const result = validateGuess(CORRECT_PLAYER_2 as any, CORRECT_PLAYER_2 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: true, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
	});
	describe('partial correct (1 right)', () => {
		test('role correct', () => {
			const player: Player = { name: 'Shaz', country: 'FI', role: 'Support', team: 'LosAngelesGladiators', region: 'PacificDivision' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: true, isTeamCorrect: false });
		});
		test('country correct', () => {
			const player: Player = { name: 'Fleta', country: 'KR', role: 'Damage', team: 'SeoulDynasty', region: 'PacificDivision' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: false, isTeamCorrect: false });
		});
		test('region correct', () => {
			const player: Player = { name: 'iRemiix', country: 'PR', role: 'Tank', team: 'LosAngelesGladiators', region: 'AtlanticDivison' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false });
		});
		test('team correct', () => {
			const player: Player = { name: 'dhaK', country: 'ES', role: 'Support', team: 'SanFranciscoShock' };
			const result = validateGuess(player as any, CORRECT_PLAYER_2 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: false, isTeamCorrect: true });
		});
	});
	describe('partial correct (2 right)', () => {
		// Skipping country + team (as team also automatically means region)
		test('country + role correct', () => {
			const player: Player = { name: 'Izayaki', country: 'KR', role: 'Support', team: 'LosAngelesValiant', region: 'PacificDivision' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: true, isTeamCorrect: false });
		});
		test('country + region correct', () => {
			const player: Player = { name: 'Gamsu', country: 'KR', role: 'Tank', team: 'BostonUprising', region: 'AtlanticDivison' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false });
		});
		test('role + region correct', () => {
			const player: Player = { name: 'Bani', country: 'CA', role: 'Support', team: 'HoustonOutlaws', region: 'AtlanticDivison' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: false });
		});
	});
	describe('partial correct (3 right)', () => {
		test('country + role + region correct', () => {
			const player: Player = { name: 'Neko', country: 'KR', role: 'Support', team: 'BostonUprising', region: 'AtlanticDivison' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: false });
		});
		test('team + region + role correct', () => {
			const player: Player = { name: 'nomy', country: 'MX', role: 'Tank', team: 'SanFranciscoShock', region: 'PacificDivision' };
			const result = validateGuess(player as any, CORRECT_PLAYER_2 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
		test('team + region + country correct', () => {
			const player: Player = { name: 'Saebyeolbe', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior', region: 'AtlanticDivison' };
			const result = validateGuess(player as any, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: true });
		});
	});
});

describe('sub-role matching', () => {
	const CORRECT_FLEX_SUPPORT: any = { name: 'Twilight', country: 'KR', role: 'Support', team: 'LosAngelesValiant', region: 'PacificDivision', subRole: 'FlexSupport' };
	const CORRECT_HITSCAN: any = { name: 'Fleta', country: 'KR', role: 'Damage', team: 'SeoulDynasty', region: 'PacificDivision', subRole: 'Hitscan' };

	test('same role, different subRole → partial, isRoleCorrect true', () => {
		const guess: any = { name: 'Shaz', country: 'FI', role: 'Support', team: 'LosAngelesGladiators', region: 'PacificDivision', subRole: 'MainSupport' };
		const result = validateGuess(guess, CORRECT_FLEX_SUPPORT);
		expect(result.isRoleCorrect).toBe(true);
		expect(result.roleMatch).toBe('partial');
	});

	test('same role + same subRole → correct, isRoleCorrect true', () => {
		const guess: any = { name: 'Izayaki', country: 'KR', role: 'Support', team: 'LosAngelesGladiators', region: 'PacificDivision', subRole: 'FlexSupport' };
		const result = validateGuess(guess, CORRECT_FLEX_SUPPORT);
		expect(result.isRoleCorrect).toBe(true);
		expect(result.roleMatch).toBe('correct');
	});

	test('different role with subRole on correct player → incorrect, isRoleCorrect false', () => {
		const guess: any = { name: 'super', country: 'US', role: 'Tank', team: 'SanFranciscoShock', region: 'PacificDivision' };
		const result = validateGuess(guess, CORRECT_FLEX_SUPPORT);
		expect(result.isRoleCorrect).toBe(false);
		expect(result.roleMatch).toBe('incorrect');
	});

	test('legacy (no subRole on answer) → roleMatch is undefined', () => {
		const correctNoSubRole: any = { name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior', region: 'AtlanticDivison' };
		const guess: any = { name: 'Shaz', country: 'FI', role: 'Support', team: 'LosAngelesGladiators', region: 'PacificDivision' };
		const result = validateGuess(guess, correctNoSubRole);
		expect(result.isRoleCorrect).toBe(true);
		expect(result.roleMatch).toBeUndefined();
	});

	test('Damage axis: Hitscan vs FlexDPS → partial', () => {
		const guess: any = { name: 'profit', country: 'KR', role: 'Damage', team: 'LosAngelesValiant', region: 'PacificDivision', subRole: 'FlexDPS' };
		const result = validateGuess(guess, CORRECT_HITSCAN);
		expect(result.isRoleCorrect).toBe(true);
		expect(result.roleMatch).toBe('partial');
	});
});

describe('age comparison', () => {
	// 1990 player is always older than a 2002 player, whatever today's date is.
	const OLDER: any = { name: 'Old', country: 'KR', role: 'Damage', team: 'TwistedMinds', dateBorn: '1990-05-10' };
	const YOUNGER: any = { name: 'Young', country: 'KR', role: 'Damage', team: 'TwistedMinds', dateBorn: '2002-05-10' };

	test('answer older than guess → higher', () => {
		const result = validateGuess(YOUNGER, OLDER);
		expect(result.ageComparison).toBe('higher');
	});

	test('answer younger than guess → lower', () => {
		const result = validateGuess(OLDER, YOUNGER);
		expect(result.ageComparison).toBe('lower');
	});

	test('identical birth date → equal', () => {
		const result = validateGuess(OLDER, { ...OLDER });
		expect(result.ageComparison).toBe('equal');
	});

	test('answer has no dateBorn → ageComparison undefined', () => {
		const correctNoDob: any = { name: 'X', country: 'KR', role: 'Damage', team: 'TwistedMinds' };
		const result = validateGuess(OLDER, correctNoDob);
		expect(result.ageComparison).toBeUndefined();
	});

	test('guess has no dateBorn → ageComparison undefined', () => {
		const guessNoDob: any = { name: 'X', country: 'KR', role: 'Damage', team: 'TwistedMinds' };
		const result = validateGuess(guessNoDob, OLDER);
		expect(result.ageComparison).toBeUndefined();
	});
});

describe('getAgeFromDate', () => {
	test('birthday today → exact age', () => {
		const now = new Date();
		const mm = String(now.getMonth() + 1).padStart(2, '0');
		const dd = String(now.getDate()).padStart(2, '0');
		expect(getAgeFromDate(`${now.getFullYear() - 25}-${mm}-${dd}`)).toBe(25);
	});

	test('unparseable input → undefined', () => {
		expect(getAgeFromDate('not-a-date')).toBeUndefined();
	});
});
