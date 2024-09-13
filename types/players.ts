import { countries, type CountryCode } from '@/types/countries';
import { z } from 'zod';

/**
 * Type for player from database
 */
export type Player = z.infer<typeof playerSchema>;

const ROLES = ['Damage', 'Tank', 'Support'] as const;

// Keep types in array to check what region player is from
const EASTERN = ['BostonUprising', 'FloridaMayhem', 'HoustonOutlaws', 'LondonSpitfire', 'NewYorkExcelsior', 'PhiladelphiaFusion'] as const;
const WESTERN = ['DallasFuel', 'LosAngelesGladiators', 'LosAngelesValiant', 'SanFranciscoShock', 'SeoulDynasty', 'ShanghaiDragons'] as const;

type EasternTeam = (typeof EASTERN)[number];
type WesternTeam = (typeof WESTERN)[number];
type OWLTeam = EasternTeam | WesternTeam;

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
	isEastern: z.boolean().optional(),
	/**
	 * Player id
	 */
	id: z.number().optional(),
});

/**
 * Checks if a team is Eastern/Western (or Atlantic/Pacific)
 * @param team team to check
 * @returns true, if team is Eastern/Atlantic and false, if the team is Western/Pacific
 */
export function isEastern(team: OWLTeam): boolean {
	return EASTERN.includes(team as unknown as EasternTeam);
}
