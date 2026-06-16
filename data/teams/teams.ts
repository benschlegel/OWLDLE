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

const EMEA_OWCS_S1 = [
	'ENCE',
	'VirtusPro',
	'SpacestationGaming',
	'TwistedMinds',
	'PieceofCake',
	'SrPeakCheck',
	'TeamPeps',
	'QuickEsports',
	'WASPXOHHHHNO',
	'AOneManArmy',
	'ExOblivione',
	'TeamG4mbit',
	'NegMentalAttitude',
	'Hypnos',
	'Metaboiz',
	'Vendetta',
] as const;
const NA_OWCS_S1 = [
	'TorontoDefiant',
	'NRGShock',
	'NTMR',
	'CitrusNation',
	'TSM',
	'O3Splash',
	'FluffyDreamland',
	'Shikigami',
	'TanukiTapire',
	'EXNZenith',
	'Ramattrapunch',
	'Absolution',
	'TeamZ',
	'RadxAvidity',
	'BlastOffBuds',
	'YFPGaming',
] as const;
const KR_OWCS_S1 = ['TeamFalcons', 'CrazyRaccoon', 'ZETADIVISION', 'Fnatic', 'HaeJeokDan', 'VEC', 'PokerFace', 'OldOcean'] as const;

const EMEA_OWCS_S2 = ['AlQadsiah', 'TwistedMinds', 'VirtusPro', 'GenG', 'TeamPeps', 'TeamVision', 'GoudGuysANM', 'QuickEsports'] as const;
const NA_OWCS_S2 = ['GeekayEsports', 'TeamLiquid', 'NTMR', 'SpacestationGaming', 'SakuraEsports', 'Extinction', 'TeamZ', 'DhillDucks'] as const;
const KR_OWCS_S2 = ['CrazyRaccoon', 'T1', 'WAE', 'ZETADIVISION', 'TeamFalcons', 'OnsideGaming'] as const;

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

const EMEA_OWCS_S3 = ['TeamPeps', 'TwistedMinds', 'VirtusPro', 'GeekayEsports', 'AlQadsiah', 'AnyonesLegend'] as const;
const NA_OWCS_S3 = ['DallasFuel', 'Disguised', 'SpacestationGaming', 'TeamLiquid', 'LuneXGaming', 'Extinction'] as const;
const KR_OWCS_S3 = ['T1', 'TeamFalcons', 'CrazyRaccoon', 'ZETADIVISION', 'NewEra', 'OnsideGaming', 'ZANEsports', 'Cheeseburger', 'PokerFace'] as const;
const CN_OWCS_S3 = ['WeiboGaming', 'JDGaming', 'AllGamers', 'MilkTea', 'HomieE', 'DEG', 'SolusVictorem', 'NaivePiggy'] as const;

const ALL_EMEA = [
	{ dataset: 'owcs-s1', data: EMEA_OWCS_S1 },
	{ dataset: 'owcs-s2', data: EMEA_OWCS_S2 },
	{ dataset: 'owcs-s3', data: EMEA_OWCS_S3 },
];
const ALL_NA = [
	{ dataset: 'owcs-s1', data: NA_OWCS_S1 },
	{ dataset: 'owcs-s2', data: NA_OWCS_S2 },
	{ dataset: 'owcs-s3', data: NA_OWCS_S3 },
];
const ALL_KR = [
	{ dataset: 'owcs-s1', data: KR_OWCS_S1 },
	{ dataset: 'owcs-s2', data: KR_OWCS_S2 },
	{ dataset: 'owcs-s3', data: KR_OWCS_S3 },
];
const ALL_CN = [{ dataset: 'owcs-s3', data: CN_OWCS_S3 }];

// Latest stage of OWCS S3's team list. Next stage: add OWCS_S3_STAGE2_TEAMS and
// repoint the ALL_TEAMS 'owcs-s3' entry to it.
const OWCS_S3_STAGE1_TEAMS = [...EMEA_OWCS_S3, ...NA_OWCS_S3, ...KR_OWCS_S3, ...CN_OWCS_S3] as const;

export const ALL_TEAMS = [
	{ dataset: 'season1', data: [...EASTERN, ...WESTERN] },
	{ dataset: 'season2', data: [...EASTERN_S2, ...WESTERN_S2] },
	{ dataset: 'season3', data: [...EASTERN_S2, ...WESTERN_S2] },
	{ dataset: 'season4', data: [...EASTERN_S4, ...WESTERN_S4] },
	{ dataset: 'season5', data: [...EASTERN_S5, ...WESTERN_S5] },
	{ dataset: 'season6', data: [...EASTERN_S6, ...WESTERN_S6] },
	{ dataset: 'owcs-s1', data: [...EMEA_OWCS_S1, ...NA_OWCS_S1, ...KR_OWCS_S1] },
	{ dataset: 'owcs-s2', data: [...EMEA_OWCS_S2, ...NA_OWCS_S2, ...KR_OWCS_S2] },
	{ dataset: 'owcs-s3', data: [...EMEA_OWCS_S3, ...NA_OWCS_S3, ...KR_OWCS_S3, ...CN_OWCS_S3] },
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
	const cn = ALL_CN.find((t) => t.dataset === dataset);
	if ((eastern?.data as ReadonlyArray<string>)?.includes(team)) return 'AtlanticDivison';
	if ((western?.data as ReadonlyArray<string>)?.includes(team)) return 'PacificDivision';
	if ((emea?.data as ReadonlyArray<string>)?.includes(team)) return 'EMEA';
	if ((na?.data as ReadonlyArray<string>)?.includes(team)) return 'NA';
	if ((kr?.data as ReadonlyArray<string>)?.includes(team)) return 'Korea';
	if ((cn?.data as ReadonlyArray<string>)?.includes(team)) return 'CN';
	return undefined;
}

type TeamData = {
	dataset: Dataset;
	atlantic: string[];
	pacific: string[];
	emea: string[];
	na: string[];
	kr: string[];
	cn: string[];
};

const teamData: TeamData[] = [];

for (const teamFull of ALL_TEAMS) {
	const dataset = teamFull.dataset;
	const atlantic: string[] = [];
	const pacific: string[] = [];
	const emea: string[] = [];
	const na: string[] = [];
	const kr: string[] = [];
	const cn: string[] = [];
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
		} else if (division === 'CN') {
			cn.push(team);
		}
	}
	teamData.push({ dataset, atlantic, pacific, emea, na, kr, cn });
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
export function getCn(dataset: Dataset) {
	return teamData.find((t) => t.dataset === dataset)?.cn;
}

export const PARTNERED_TEAMS_OWCS_S3 = [
	// NA
	'DallasFuel',
	'Disguised',
	'SpacestationGaming',
	'TeamLiquid',
	// EMEA
	'TeamPeps',
	'VirtusPro',
	'TwistedMinds',
	// Korea
	'T1',
	'TeamFalcons',
	'CrazyRaccoon',
	'ZETADIVISION',
	// CN
	'WeiboGaming',
	'JDGaming',
	'AllGamers',
	'MilkTea',
] as const satisfies ReadonlyArray<TeamName<'owcs-s3'>>;

export const atlanticPacificTeams: Dataset[] = ['season1', 'season2', 'season3'] as const;
