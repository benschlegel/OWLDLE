import type { Dataset } from '@/data/datasets';
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

/**
 * Checks if a team is Eastern/Western (or Atlantic/Pacific)
 * @param team team to check
 * @returns true, if team is Eastern/Atlantic and false, if the team is Western/Pacific
 */
export function isEastern(team: OWLTeam): boolean {
	// Type casting to fix readonly behavior from array definition
	return (EASTERN as ReadonlyArray<string>).includes(team);
}

/**
 * Gets region from a team (e.g. "BostonUprising" -> "AtlanticDivision")
 * @param team team name to check
 * @returns the region a team is from (or undefined if team is invalid/in no region)
 */
export function getRegion(team: OWLTeam): Player['region'] {
	if ((EASTERN as ReadonlyArray<string>).includes(team)) return 'AtlanticDivison';
	if ((WESTERN as ReadonlyArray<string>).includes(team)) return 'PacificDivision';
	return undefined;
}

// * Season 2

const EASTERN_S2 = [
	'AtlantaReign',
	'ParisEternal',
	'TorontoDefiant',
	'WashingtonJustice',
	'BostonUprising',
	'FloridaMayhem',
	'HoustonOutlaws',
	'LondonSpitfire',
	'NewYorkExcelsior',
	'PhiladelphiaFusion',
] as const;
const WESTERN_S2 = [
	'ChengduHunters',
	'HangzhouSpark',
	'GuangzhouCharge',
	'Vancouver Titans',
	'DallasFuel',
	'LosAngelesGladiators',
	'LosAngelesValiant',
	'SanFranciscoShock',
	'SeoulDynasty',
	'ShanghaiDragons',
] as const;

const ALL_TEAMS = [
	{ dataset: 'season1', data: [...EASTERN, ...WESTERN] },
	{ dataset: 'season2', data: [...EASTERN_S2, ...WESTERN_S2] },
] as const;

export type TeamName<T extends Dataset = 'season1'> = Extract<(typeof ALL_TEAMS)[number], { dataset: T }>['data'][number];

export type GenericPlayer<T extends Dataset = 'season1'> = {
	name: string;
	role: (typeof ROLES)[number];
	country: CountryCode;
	team: TeamName<T>;
	region?: (typeof REGIONS)[number];
	isFlex?: boolean;
	id?: number;
};
