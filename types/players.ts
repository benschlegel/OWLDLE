import type { Dataset } from '@/data/datasets';
import { ALL_TEAMS, EASTERN, type TeamName, WESTERN } from '@/data/teams/teams';
import { countries, type CountryCode } from '@/types/countries';
import { z } from 'zod';

/**
 * Type for player from database
 */
export type Player<T extends Dataset = 'season1'> = z.infer<ReturnType<typeof playerSchema<T>>>;

const ROLES = ['Damage', 'Tank', 'Support'] as const;

const REGIONS = ['AtlanticDivison', 'PacificDivision'] as const;

export type Region = (typeof REGIONS)[number];

// TODO: probably remove strong typing from teams
export const playerSchema = <T extends Dataset = 'season1'>(season: T) =>
	z.object({
		/**
		 * Player name
		 */
		name: z.string().min(2).max(32),
		/**
		 * Role of player
		 */
		role: z.enum(ROLES),
		/**
		 * What country player is from
		 */
		country: z.enum(countries),
		/**
		 * What team the player is from, dynamically based on the season
		 */
		team: z.enum((ALL_TEAMS.find((seasonData) => seasonData.dataset === season)?.data ?? []) as unknown as [TeamName<T>, ...TeamName<T>[]]),
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
