import type { Dataset } from '@/data/datasets';
import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import type { Player } from '@/types/players';

// * Team data

// Keep types in array to check what region player is from
export const EASTERN = ['BostonUprising', 'FloridaMayhem', 'HoustonOutlaws', 'LondonSpitfire', 'NewYorkExcelsior', 'PhiladelphiaFusion'] as const;
export const WESTERN = ['DallasFuel', 'LosAngelesGladiators', 'LosAngelesValiant', 'SanFranciscoShock', 'SeoulDynasty', 'ShanghaiDragons'] as const;

// Season 2
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

// * Combine data

/**
 * Gets region from a team (e.g. "BostonUprising" -> "AtlanticDivision")
 * @param team team name to check
 * @param dataset what dataset to get team for
 * @returns the region a team is from (or undefined if team is invalid/in no region)
 */
export function getRegion<T extends Dataset = 'season1'>(team: TeamName<T>, dataset: Dataset = 'season1'): Player['region'] {
	const eastern = ALL_EASTERN.find((t) => t.dataset === dataset);
	const western = ALL_WESTERN.find((t) => t.dataset === dataset);
	if (!eastern || !western) return undefined;
	if ((eastern.data as ReadonlyArray<string>).includes(team)) return 'AtlanticDivison';
	if ((western.data as ReadonlyArray<string>).includes(team)) return 'PacificDivision';
	return undefined;
}

const ALL_EASTERN = [
	{ dataset: 'season1', data: EASTERN },
	{ dataset: 'season2', data: EASTERN_S2 },
] as const;

const ALL_WESTERN = [
	{ dataset: 'season1', data: WESTERN },
	{ dataset: 'season2', data: WESTERN_S2 },
] as const;

export const ALL_TEAMS = [
	{ dataset: 'season1', data: [...EASTERN, ...WESTERN] },
	{ dataset: 'season2', data: [...EASTERN_S2, ...WESTERN_S2] },
] as const;

export type TeamName<T extends Dataset = 'season1'> = Extract<(typeof ALL_TEAMS)[number], { dataset: T }>['data'][number];

const atlantic = [];
const pacific = [];
for (const team of ALL_TEAMS[0].data) {
	const division = getRegion(team);
	if (division === 'AtlanticDivison') {
		atlantic.push(team);
	} else if (division === 'PacificDivision') {
		pacific.push(team);
	}
}

export const ATLANTIC = [...atlantic];
export const PACIFIC = [...pacific];

export function getAtlantic(dataset: Dataset) {
	//
}
