import type { DbPlayer } from '@/types/database';
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

export const feedbackSchema = z.object({
	rating: z.number().min(0.5).max(5).step(0.5).optional(),
	name: z.string().trim().max(128).optional(),
	feedback: z.string().trim().max(4096),
});

export type Feedback = z.infer<typeof feedbackSchema>;

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
	correctPlayer: DbPlayer;
	/**
	 * The current iteration of the game (e.g. "3" for the third day after launch)
	 */
	iteration: number;
};
