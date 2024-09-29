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

type TeamData = {
	dataset: Dataset;
	atlantic: string[];
	pacific: string[];
};

const teamData: TeamData[] = [];

for (const teamFull of ALL_TEAMS) {
	const dataset = teamFull.dataset;
	const atlantic: string[] = [];
	const pacific: string[] = [];
	for (const team of teamFull.data) {
		const division = getRegion<typeof dataset>(team, dataset);
		if (division === 'AtlanticDivison') {
			atlantic.push(team);
		} else if (division === 'PacificDivision') {
			pacific.push(team);
		}
	}
	teamData.push({ dataset, atlantic, pacific });
}

/**
 * Get the names of all atlantic teams for a given dataset (e.g. season1)
 * @param dataset what dataset to get atlantic teams for
 * @returns array containing all atlantic team names
 */
export function getAtlantic(dataset: Dataset) {
	return teamData.find((t) => t.dataset === dataset)?.atlantic;
}

/**
 * Get the names of all pacific teams for a given dataset (e.g. season1)
 * @param dataset what dataset to get pacific teams for
 * @returns array containing all pacific team names
 */
export function getPacific(dataset: Dataset) {
	return teamData.find((t) => t.dataset === dataset)?.pacific;
}
