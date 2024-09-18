import { z } from 'zod';
import config from '../game.config.json';

const configSchema = z.object({
	/**
	 * Max guesses before game is over
	 */
	maxGuesses: z.number().min(1),
	/**
	 * Site url, e.g.  https://owldle.bschlegel.com
	 */
	siteUrl: z.string(),
	/**
	 * Name of the game (used in header of game result), e.g. OWLS1LE
	 */
	gameName: z.string(),
	/**
	 * What image extensions all images in /public/teams/s1 use (e.g. "png" or "avif")
	 */
	teamLogoImgExtension: z.string(),
	/**
	 * What size to generate backlog (e.g. 10 would pick 10 random players, pop the first one each iteration and re-fill with 10 more once the backlog runs out)
	 */
	backlogMaxSize: z.number().min(1),
	/**
	 * How many hours to start next reset after current iteration runs out (e.g. 24 => reset once per day)
	 * !Important: make sure you match your vercel cron job
	 */
	nextResetHours: z.number().min(1),
});

export const GAME_CONFIG = configSchema.parse(config);
