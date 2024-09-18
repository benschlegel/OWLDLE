import type { Player } from '@/types/players';
import { z } from 'zod';

export type GuessResponse = z.infer<typeof GuessSchema>;

export const GuessSchema = z.object({
	isRoleCorrect: z.boolean(),
	isCountryCorrect: z.boolean(),
	isTeamCorrect: z.boolean(),
	isNameCorrect: z.boolean(),
	isRegionCorrect: z.boolean(),
});

export type PlayerWithRegion = {
	name: Player['name'];
	role: Player['role'];
	country: Player['country'];
	team: Player['team'];
	region: NonNullable<Player['region']>;
	id: number;
};

export type ValidateResponse = {
	/**
	 * When the game next rests
	 */
	nextReset: Date;
	/**
	 * Today's correct player
	 */
	correctPlayer: PlayerWithRegion;
	/**
	 * The current iteration of the game (e.g. "3" for the third day after launch)
	 */
	iteration: number;
};
