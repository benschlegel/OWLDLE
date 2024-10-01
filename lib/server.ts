import type { DbPlayer } from '@/types/database';
import type { Player } from '@/types/players';
import type { GuessResponse } from '@/types/server';

/**
 * Validates a guess and returns what fields are correct
 * @param guess the player to guess
 * @param correct the correct player
 * @returns Object containing what entries are correct/incorrect
 */
export function validateGuess(guess: Player, correct: DbPlayer): GuessResponse {
	// TODO: make clean
	const response: GuessResponse = { isRegionCorrect: false, isCountryCorrect: false, isNameCorrect: false, isRoleCorrect: false, isTeamCorrect: false };

	if (guess.country === correct.country) {
		response.isCountryCorrect = true;
	}
	if (guess.name === correct.name) {
		response.isNameCorrect = true;
	}
	if (guess.role === correct.role) {
		response.isRoleCorrect = true;
	}
	if (guess.team === correct.team) {
		response.isTeamCorrect = true;
	}
	if (guess.region === correct.region) {
		response.isRegionCorrect = true;
	}

	return response;
}

/**
 * Adds full days to a Date
 * @param date Date to add time to
 * @param days How many days to add
 * @returns New date with 'days' more days
 */
export function addDays(date: Date, days: number) {
	const newDate = new Date(date.valueOf());
	newDate.setDate(newDate.getDate() + days);
	return newDate;
}
