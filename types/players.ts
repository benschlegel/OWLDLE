import type { Dataset } from '@/data/datasets';
import { EASTERN, type TeamName, WESTERN } from '@/data/teams/teams';
import { countries, type CountryCode } from '@/types/countries';
import { z } from 'zod';

/**
 * Type for player from database
 */
export type Player = z.infer<typeof playerSchema>;

const ROLES = ['Damage', 'Tank', 'Support'] as const;

const REGIONS = ['AtlanticDivison', 'PacificDivision'] as const;

// TODO: probably remove strong typing from teams
export const playerSchema = z.object({
	/**
	 * Player name
	 */
	name: z.string(),
	/**
	 * Role of player
	 */
	role: z.enum(ROLES),
	/**
	 * What country player is from
	 */
	country: z.enum(countries),
	/**
	 * What team the player is from
	 */
	team: z.union([z.enum(EASTERN), z.enum(WESTERN)]),
	/**
	 * Wether player is eastern (player is western if false)
	 */
	region: z.enum(REGIONS).optional(),
	/**
	 * Wether player is marked as flex by liquipedia
	 */
	isFlex: z.boolean().optional(),
	/**
	 * Player id
	 */
	id: z.number().optional(),
});

export type GenericPlayer<T extends Dataset = 'season1'> = {
	name: string;
	role: (typeof ROLES)[number];
	country: CountryCode;
	team: TeamName<T>;
	region?: (typeof REGIONS)[number];
	isFlex?: boolean;
	id?: number;
};
