import { validateGuess } from '@/lib/server';
import type { Player } from '@/types/players';
import { test, expect, describe } from 'bun:test';

// JJoNak (KR Support, NYXL, East)
const CORRECT_PLAYER_1: Player = { name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior', isEastern: true };

// super (NA Tank, SFShock, West)
const CORRECT_PLAYER_2: Player = { name: 'super', country: 'US', role: 'Tank', team: 'SanFranciscoShock', isEastern: false };

describe('validate guesses', () => {
	describe('correct guess', () => {
		test('all correct player1', () => {
			const result = validateGuess(CORRECT_PLAYER_1, CORRECT_PLAYER_1);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: true, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
		test('all correct player2', () => {
			const result = validateGuess(CORRECT_PLAYER_2, CORRECT_PLAYER_2);
			expect(result).toEqual({ isCountryCorrect: true, isNameCorrect: true, isRegionCorrect: true, isRoleCorrect: true, isTeamCorrect: true });
		});
	});
});
