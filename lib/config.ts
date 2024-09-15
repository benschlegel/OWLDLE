import { z } from 'zod';
import config from '../game.config.json';

const configSchema = z.object({
	/**
	 * Max guesses before game is over
	 */
	maxGuesses: z.number().min(1),
	/**
	 * Shorthand of url (for footer in game result), e.g.  OWLS1le.bschlegel.com
	 */
	siteUrlShorthand: z.string(),
	/**
	 * Name of the game (used in header of game result), e.g. OWLS1LE
	 */
	gameName: z.string(),
	/**
	 * What image extensions all images in /public/teams/s1 use (e.g. "png" or "avif")
	 */
	teamLogoImgExtension: z.string(),
});

export const GAME_CONFIG = configSchema.parse(config);
