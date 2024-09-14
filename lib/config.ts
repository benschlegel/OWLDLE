import { z } from 'zod';
import config from '../game.config.json' assert { type: 'json' };

const configSchema = z.object({
	maxGuesses: z.number().min(1),
});

export const GAME_CONFIG = configSchema.parse(config);
