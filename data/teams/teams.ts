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
	'VancouverTitans',
	'DallasFuel',
	'LosAngelesGladiators',
	'LosAngelesValiant',
	'SanFranciscoShock',
	'SeoulDynasty',
	'ShanghaiDragons',
] as const;

// Season 3 same teams/split as S2

// Season 4
const EASTERN_S4 = [
	'ChengduHunters',
	'GuangzhouCharge',
	'HangzhouSpark',
	'NewYorkExcelsior',
	'LosAngelesValiant',
	'PhiladelphiaFusion',
	'SeoulDynasty',
	'ShanghaiDragons',
] as const;

const WESTERN_S4 = [
	'AtlantaReign',
	'BostonUprising',
	'DallasFuel',
	'FloridaMayhem',
	'HoustonOutlaws',
	'LondonSpitfire',
	'LosAngelesGladiators',
	'ParisEternal',
	'SanFranciscoShock',
	'TorontoDefiant',
	'VancouverTitans',
	'WashingtonJustice',
] as const;

const EASTERN_S5 = [
	'ChengduHunters',
	'GuangzhouCharge',
	'HangzhouSpark',
	'LosAngelesValiant',
	'PhiladelphiaFusion',
	'SeoulDynasty',
	'ShanghaiDragons',
] as const;

const WESTERN_S5 = [
	'AtlantaReign',
	'BostonUprising',
	'DallasFuel',
	'FloridaMayhem',
	'HoustonOutlaws',
	'LondonSpitfire',
	'LosAngelesGladiators',
	'NewYorkExcelsior',
	'ParisEternal',
	'SanFranciscoShock',
	'TorontoDefiant',
	'VancouverTitans',
	'WashingtonJustice',
] as const;

const EASTERN_S6 = ['DallasFuel', 'GuangzhouCharge', 'HangzhouSpark', 'SeoulDynasty', 'SeoulInfernal', 'ShanghaiDragons'] as const;

const WESTERN_S6 = [
	'AtlantaReign',
	'BostonUprising',
	'FloridaMayhem',
	'HoustonOutlaws',
	'LondonSpitfire',
	'LosAngelesGladiators',
	'LosAngelesValiant',
	'NewYorkExcelsior',
	'VegasEternal',
	'SanFranciscoShock',
	'TorontoDefiant',
	'VancouverTitans',
	'WashingtonJustice',
] as const;

const EMEA_OWCS_S2 = ['GenG', 'TwistedMinds', 'VirtusPro', 'TheUltimates', 'SakuraEsports', 'TeamPeps', 'AlQadsiah', 'TeamVision'] as const;
const NA_OWCS_S2 = ['SpacestationGaming', 'TeamLiquid', 'Timeless', 'Avidity', 'RadEsports', 'NTMR', 'Shikigami', 'Amplify'] as const;
const KR_OWCS_S2 = ['CrazyRaccoon', 'T1', 'TeamFalcons', 'ZETADIVISION', 'PokerFace', 'WAY', 'VEC', 'NewEra', 'FromTheGamer'] as const;

// * Combine data

const ALL_EASTERN = [
	{ dataset: 'season1', data: EASTERN },
	{ dataset: 'season2', data: EASTERN_S2 },
	{ dataset: 'season3', data: EASTERN_S2 },
	{ dataset: 'season4', data: EASTERN_S4 },
	{ dataset: 'season5', data: EASTERN_S5 },
	{ dataset: 'season6', data: EASTERN_S6 },
] as const;

const ALL_WESTERN = [
	{ dataset: 'season1', data: WESTERN },
	{ dataset: 'season2', data: WESTERN_S2 },
	{ dataset: 'season3', data: WESTERN_S2 },
	{ dataset: 'season4', data: WESTERN_S4 },
	{ dataset: 'season5', data: WESTERN_S5 },
	{ dataset: 'season6', data: WESTERN_S6 },
] as const;

const ALL_EMEA = [{ dataset: 'owcs-s2', data: EMEA_OWCS_S2 }];
const ALL_NA = [{ dataset: 'owcs-s2', data: NA_OWCS_S2 }];
const ALL_KR = [{ dataset: 'owcs-s2', data: KR_OWCS_S2 }];

export const ALL_TEAMS = [
	{ dataset: 'season1', data: [...EASTERN, ...WESTERN] },
	{ dataset: 'season2', data: [...EASTERN_S2, ...WESTERN_S2] },
	{ dataset: 'season3', data: [...EASTERN_S2, ...WESTERN_S2] },
	{ dataset: 'season4', data: [...EASTERN_S4, ...WESTERN_S4] },
	{ dataset: 'season5', data: [...EASTERN_S5, ...WESTERN_S5] },
	{ dataset: 'season5', data: [...EASTERN_S5, ...WESTERN_S5] },
	{ dataset: 'season6', data: [...EASTERN_S6, ...WESTERN_S6] },
	{ dataset: 'owcs-s2', data: [...EMEA_OWCS_S2, ...NA_OWCS_S2, ...KR_OWCS_S2] },
] as const;

export type TeamName<T extends Dataset = 'season1'> = Extract<(typeof ALL_TEAMS)[number], { dataset: T }>['data'][number];
const allTeamNames = ALL_TEAMS.flatMap((t) => t.data);
export type TeamNamesFull = (typeof allTeamNames)[number];

/**
 * Gets region from a team (e.g. "BostonUprising" -> "AtlanticDivision")
 * @param team team name to check
 * @param dataset what dataset to get team for
 * @returns the region a team is from (or undefined if team is invalid/in no region)
 */
export function getRegion<T extends Dataset = 'season1'>(team: TeamName<T>, dataset: Dataset = 'season1'): Player['region'] {
	const eastern = ALL_EASTERN.find((t) => t.dataset === dataset);
	const western = ALL_WESTERN.find((t) => t.dataset === dataset);
	const emea = ALL_EMEA.find((t) => t.dataset === dataset);
	const na = ALL_NA.find((t) => t.dataset === dataset);
	const kr = ALL_KR.find((t) => t.dataset === dataset);
	// if (!eastern || !western) return undefined;
	if ((eastern?.data as ReadonlyArray<string>).includes(team)) return 'AtlanticDivison';
	if ((western?.data as ReadonlyArray<string>).includes(team)) return 'PacificDivision';
	if ((emea?.data as ReadonlyArray<string>).includes(team)) return 'EMEA';
	if ((na?.data as ReadonlyArray<string>).includes(team)) return 'NA';
	if ((kr?.data as ReadonlyArray<string>).includes(team)) return 'Korea';
	return undefined;
}

type TeamData = {
	dataset: Dataset;
	atlantic: string[];
	pacific: string[];
	emea: string[];
	na: string[];
	kr: string[];
};

const teamData: TeamData[] = [];

for (const teamFull of ALL_TEAMS) {
	const dataset = teamFull.dataset;
	const atlantic: string[] = [];
	const pacific: string[] = [];
	const emea: string[] = [];
	const na: string[] = [];
	const kr: string[] = [];
	for (const team of teamFull.data) {
		const division = getRegion<typeof dataset>(team, dataset);
		if (division === 'AtlanticDivison') {
			atlantic.push(team);
		} else if (division === 'PacificDivision') {
			pacific.push(team);
		} else if (division === 'EMEA') {
			emea.push(team);
		} else if (division === 'NA') {
			na.push(team);
		} else if (division === 'Korea') {
			kr.push(team);
		}
	}
	teamData.push({ dataset, atlantic, pacific, emea, na, kr });
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

export function getEmea(dataset: Dataset) {
	return teamData.find((t) => t.dataset === dataset)?.emea;
}
export function getNa(dataset: Dataset) {
	return teamData.find((t) => t.dataset === dataset)?.na;
}
export function getKr(dataset: Dataset) {
	return teamData.find((t) => t.dataset === dataset)?.kr;
}

export const atlanticPacificTeams: Dataset[] = ['season1', 'season2', 'season3'] as const;
