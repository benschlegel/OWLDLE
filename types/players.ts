import type { CountryCode } from '@/types/countries';

/**
 * Type for player from database
 */
export type Player = {
	/**
	 * Player name
	 */
	name: string;
	/**
	 * Role of player
	 */
	role: Role;
	/**
	 * What country player is from
	 */
	country: CountryCode;
	/**
	 * What team the player is from
	 */
	team: OWLTeam;
};

type Role = 'Damage' | 'Tank' | 'Support';

// Keep types in array to check what region player is from
const eastern = ['BostonUprising', 'FloridaMayhem', 'HoustonOutlaws', 'LondonSpitfire', 'NewYorkExcelsior', 'PhiladelphiaFusion'] as const;
const western = ['DallasFuel', 'LosAngelesGladiators', 'LosAngelesValiant', 'SanFranciscoShock', 'SeoulDynasty', 'ShanghaiDragons'] as const;

type EasternTeam = (typeof eastern)[number];
type WesternTeam = (typeof western)[number];
type OWLTeam = EasternTeam | WesternTeam;

/**
 * Checks if a team is Eastern/Western (or Atlantic/Pacific)
 * @param team team to check
 * @returns true, if team is Eastern/Atlantic and false, if the team is Western/Pacific
 */
export function isEastern(team: OWLTeam): boolean {
	return eastern.includes(team as unknown as EasternTeam);
}
