import { validateGuess } from '@/lib/server';
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
			const result = validateGuess(CORRECT_PLAYER_1, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: true, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
		test('all correct player2', () => {
			const result = validateGuess(CORRECT_PLAYER_2, CORRECT_PLAYER_2 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: true, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
	});
	describe('partial correct (1 right)', () => {
		test('role correct', () => {
			const player: Player = { name: 'Shaz', country: 'FI', role: 'Support', team: 'LosAngelesGladiators', region: 'PacificDivision' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: true, isTeamCorrect: false });
		});
		test('country correct', () => {
			const player: Player = { name: 'Fleta', country: 'KR', role: 'Damage', team: 'SeoulDynasty', region: 'PacificDivision' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: false, isTeamCorrect: false });
		});
		test('region correct', () => {
			const player: Player = { name: 'iRemiix', country: 'PR', role: 'Tank', team: 'LosAngelesGladiators', region: 'AtlanticDivison' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false });
		});
		test('team correct', () => {
			const player: Player = { name: 'dhaK', country: 'ES', role: 'Support', team: 'SanFranciscoShock' };
			const result = validateGuess(player, CORRECT_PLAYER_2 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: false, isTeamCorrect: true });
		});
	});
	describe('partial correct (2 right)', () => {
		// Skipping country + team (as team also automatically means region)
		test('country + role correct', () => {
			const player: Player = { name: 'Izayaki', country: 'KR', role: 'Support', team: 'LosAngelesValiant', region: 'PacificDivision' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: true, isTeamCorrect: false });
		});
		test('country + region correct', () => {
			const player: Player = { name: 'Gamsu', country: 'KR', role: 'Tank', team: 'BostonUprising', region: 'AtlanticDivison' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false });
		});
		test('role + region correct', () => {
			const player: Player = { name: 'Bani', country: 'CA', role: 'Support', team: 'HoustonOutlaws', region: 'AtlanticDivison' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: false });
		});
	});
	describe('partial correct (3 right)', () => {
		test('country + role + region correct', () => {
			const player: Player = { name: 'Neko', country: 'KR', role: 'Support', team: 'BostonUprising', region: 'AtlanticDivison' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: false });
		});
		test('team + region + role correct', () => {
			const player: Player = { name: 'nomy', country: 'MX', role: 'Tank', team: 'SanFranciscoShock', region: 'PacificDivision' };
			const result = validateGuess(player, CORRECT_PLAYER_2 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: false, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
		test('team + region + country correct', () => {
			const player: Player = { name: 'Saebyeolbe', country: 'KR', role: 'Damage', team: 'NewYorkExcelsior', region: 'AtlanticDivison' };
			const result = validateGuess(player, CORRECT_PLAYER_1 as Required<Player>);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: true });
		});
	});
});
