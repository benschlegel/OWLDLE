import type { Dataset } from '@/data/datasets';
import type { TeamName } from '@/data/teams/teams';
import { GAME_CONFIG } from '@/lib/config';
export type TeamLogoData<T extends Dataset = 'season1'> = {
	teamName: TeamName<T>;
	backgroundColor: string;
	imgUrl: string;
	displayName: string;
	useDarkForeground?: boolean;
};

const teamLogosS1: Partial<TeamLogoData>[] = [
	{
		teamName: 'BostonUprising',
		displayName: 'Boston Uprising',
		backgroundColor: '#25487e',
	},
	{
		teamName: 'DallasFuel',
		displayName: 'Dallas Fuel',
		backgroundColor: '#152841',
	},
	{
		teamName: 'FloridaMayhem',
		displayName: 'Florida Mayhem',
		backgroundColor: '#fdda00',
		useDarkForeground: true,
	},
	{
		teamName: 'HoustonOutlaws',
		displayName: 'Houston Outlaws',
		backgroundColor: '#000000',
	},
	{
		teamName: 'LondonSpitfire',
		displayName: 'London Spitfire',
		backgroundColor: '#5bcae9',
		useDarkForeground: true,
	},
	{
		teamName: 'LosAngelesGladiators',
		displayName: 'Los Angeles Gladiators',
		backgroundColor: '#3a165b',
	},
	{
		teamName: 'LosAngelesValiant',
		displayName: 'Los Angeles Valiant',
		backgroundColor: '#2f7139',
	},
	{
		teamName: 'NewYorkExcelsior',
		displayName: 'New York Excelsior',
		backgroundColor: '#1d213d',
	},
	{
		teamName: 'PhiladelphiaFusion',
		displayName: 'Philadelphia Fusion',
		backgroundColor: '#ffffff',
		useDarkForeground: true,
	},
	{
		teamName: 'SanFranciscoShock',
		displayName: 'San Francisco Shock',
		backgroundColor: '#ffffff',
		useDarkForeground: true,
	},
	{
		teamName: 'SeoulDynasty',
		displayName: 'Seoul Dynasty',
		backgroundColor: '#000000',
	},
	{
		teamName: 'ShanghaiDragons',
		displayName: 'Shanghai Dragons',
		backgroundColor: '#b71b20',
	},
];

const teamLogosS2: Partial<TeamLogoData<'season2'>>[] = [
	{
		teamName: 'AtlantaReign',
		displayName: 'Atlanta Reign',
		backgroundColor: '#c4c4c4',
		useDarkForeground: true,
	},
	{
		teamName: 'ChengduHunters',
		displayName: 'Chengdu Hunters',
		backgroundColor: '#fe9e0a',
		useDarkForeground: true,
	},
	{
		teamName: 'GuangzhouCharge',
		displayName: 'Guangzhou Charge',
		backgroundColor: '#122d42',
	},
	{
		teamName: 'HangzhouSpark',
		displayName: 'Hangzhou Spark',
		backgroundColor: '#fa729a',
	},
	{
		teamName: 'ParisEternal',
		displayName: 'Paris Eternal',
		backgroundColor: '#242a38',
	},
	{
		teamName: 'TorontoDefiant',
		displayName: 'Toronto Defiant',
		backgroundColor: '#000',
	},
	{
		teamName: 'VancouverTitans',
		displayName: 'Vancouver Titans',
		backgroundColor: '#0a226c',
	},
	{
		teamName: 'WashingtonJustice',
		displayName: 'Washington Justice',
		backgroundColor: '#eeeeee',
		useDarkForeground: true,
	},
];

const teamLogosS3: Partial<TeamLogoData<'season3'>>[] = [
	{
		teamName: 'FloridaMayhem',
		displayName: 'Florida Mayhem',
		backgroundColor: '#000',
	},
	{
		teamName: 'SanFranciscoShock',
		displayName: 'San Francisco Shock',
		backgroundColor: '#000',
	},
	{
		teamName: 'LosAngelesValiant',
		displayName: 'Los Angeles Valiant',
		backgroundColor: '#1888c6',
	},
];

const teamLogosS5: Partial<TeamLogoData<'season4'>>[] = [
	{
		teamName: 'LosAngelesGladiators',
		displayName: 'Los Angeles Gladiators',
		backgroundColor: '#60269e',
	},
];

const teamLogosS6: TeamLogoData<'season6'>[] = [
	{
		teamName: 'SeoulInfernal',
		displayName: 'Seoul Infernal',
		backgroundColor: '#e30e2c',
		imgUrl: `/teams/s6/SeoulInfernal.${GAME_CONFIG.teamLogoImgExtension}`,
	},
	{
		teamName: 'VegasEternal',
		displayName: 'Vegas Eternal',
		backgroundColor: '#000',
		imgUrl: `/teams/s6/VegasEternal.${GAME_CONFIG.teamLogoImgExtension}`,
	},
];

const teamLogosOWCS_S2: Partial<TeamLogoData<'owcs-s2'>>[] = [
	/**
	 * EMEA
	 */
	{
		teamName: 'GenG',
		displayName: 'Gen.G',
		backgroundColor: '#202127',
	},
	{
		teamName: 'TwistedMinds',
		displayName: 'Twisted Minds',
		backgroundColor: '#202127',
	},
	{
		teamName: 'VirtusPro',
		displayName: 'Virtus.pro',
		backgroundColor: '#202127',
	},
	{
		teamName: 'TheUltimates',
		displayName: 'The Ultimates',
		backgroundColor: '#202127',
	},
	{
		teamName: 'FrostTailsEsports',
		displayName: 'Frost Tails Esport',
		backgroundColor: '#202127',
	},
	{
		teamName: 'TeamPeps',
		displayName: 'Team Peps',
		backgroundColor: '#202127',
	},
	{
		teamName: 'AlQadsiah',
		displayName: 'Al Qadsiah',
		backgroundColor: '#202127',
	},
	{
		teamName: 'QuickEsports',
		displayName: 'Quick Esports',
		backgroundColor: '#202127',
	},
	/**
	 * NA
	 */
	{
		teamName: 'SpacestationGaming',
		displayName: 'Spacestation Gaming',
		backgroundColor: '#202127',
	},
	{
		teamName: 'TeamLiquid',
		displayName: 'Team Liquid',
		backgroundColor: '#202127',
	},
	{
		teamName: 'GeekayEsports',
		displayName: 'Geekay Esports',
		backgroundColor: '#202127',
	},
	{
		teamName: 'Extinction',
		displayName: 'Extinction',
		backgroundColor: '#202127',
	},
	{
		teamName: 'SakuraEsports',
		displayName: 'Sakura Esports',
		backgroundColor: '#202127',
	},
	{
		teamName: 'NTMR',
		displayName: 'NTMR',
		backgroundColor: '#202127',
	},
	{
		teamName: 'Supernova',
		displayName: 'Supernova',
		backgroundColor: '#202127',
	},
	{
		teamName: 'DhillDucks',
		displayName: 'DhillDucks',
		backgroundColor: '#202127',
	},
	/**
	 * Korea
	 */
	{
		teamName: 'CrazyRaccoon',
		displayName: 'Crazy Raccoon',
		backgroundColor: '#202127',
	},
	{
		teamName: 'T1',
		displayName: 'T1',
		backgroundColor: '#202127',
	},
	{
		teamName: 'TeamFalcons',
		displayName: 'Team Falcons',
		backgroundColor: '#202127',
	},
	{
		teamName: 'ZETADIVISION',
		displayName: 'ZETA DIVISION',
		backgroundColor: '#202127',
	},
	{
		teamName: 'PokerFace',
		displayName: 'Poker Face',
		backgroundColor: '#202127',
	},
	{
		teamName: 'OnsideGaming',
		displayName: 'ONSIDE Gaming',
		backgroundColor: '#202127',
	},
	{
		teamName: 'VEC',
		displayName: 'VEC',
		backgroundColor: '#202127',
	},
	{
		teamName: 'AllGamersGlobal',
		displayName: 'All Gamers Global',
		backgroundColor: '#202127',
	},
	{
		teamName: 'OldOcean',
		displayName: 'Old Ocean',
		backgroundColor: '#202127',
	},
];

export const TEAM_LOGOS_S1: TeamLogoData[] = teamLogosS1.map(
	(team) => ({ ...team, imgUrl: `/teams/s1/${team.teamName}.${GAME_CONFIG.teamLogoImgExtension}` }) as TeamLogoData
);

// Add new logos and combine with old ones for full season 2 team logos
const logosS2: TeamLogoData<'season2'>[] = teamLogosS2.map(
	(team) => ({ ...team, imgUrl: `/teams/s2/${team.teamName}.${GAME_CONFIG.teamLogoImgExtension}` }) as TeamLogoData<'season2'>
);
const TEAM_LOGOS_S2: TeamLogoData<'season2'>[] = [...(TEAM_LOGOS_S1 as unknown[] as TeamLogoData<'season2'>[]), ...logosS2];

// Copy old logos, update to new colors/pictures
const TEAM_LOGOS_S3 = [...(TEAM_LOGOS_S2 as unknown as TeamLogoData<'season3'>[])];
for (const logo of teamLogosS3) {
	const oldLogoIndex = TEAM_LOGOS_S3.findIndex((l) => l.teamName === logo.teamName);
	if (oldLogoIndex !== -1) {
		TEAM_LOGOS_S3[oldLogoIndex] = {
			...TEAM_LOGOS_S3[oldLogoIndex],
			...logo,
			useDarkForeground: logo.useDarkForeground,
			imgUrl: `/teams/s3/${logo.teamName}.${GAME_CONFIG.teamLogoImgExtension}`,
		};
	}
}

const TEAM_LOGOS_S5 = [...TEAM_LOGOS_S3];
const oldGlads = TEAM_LOGOS_S5.find((l) => l.teamName === teamLogosS5[0].teamName);
if (oldGlads) {
	oldGlads.backgroundColor = teamLogosS5[0].backgroundColor ?? '#fff';
	oldGlads.imgUrl = `/teams/s4/${oldGlads.teamName}.${GAME_CONFIG.teamLogoImgExtension}`;
}

const teamLogosS6Raw = [...TEAM_LOGOS_S5] as unknown as TeamLogoData<'season6'>[];
const TEAM_LOGOS_S6 = teamLogosS6Raw.filter((l) => l.teamName !== ('PhiladelphiaFusion' as string) && l.teamName !== ('ParisEternal' as string));
TEAM_LOGOS_S6.push(teamLogosS6[0]);
TEAM_LOGOS_S6.push(teamLogosS6[1]);

export const TEAM_LOGOS_OWCS_S2: TeamLogoData<'owcs-s2'>[] = teamLogosOWCS_S2.map(
	(team) => ({ ...team, imgUrl: `/teams/owcs-s2/${team.teamName}.${GAME_CONFIG.teamLogoImgExtension}` }) as TeamLogoData<'owcs-s2'>
);

type LogoData<T extends Dataset> = {
	dataset: T;
	data: TeamLogoData<T>[];
};

export type CombinedLogoData =
	| LogoData<'season1'>
	| LogoData<'season2'>
	| LogoData<'season3'>
	| LogoData<'season4'>
	| LogoData<'season5'>
	| LogoData<'season6'>
	| LogoData<'owcs-s2'>;

export const LOGOS: CombinedLogoData[] = [
	{ dataset: 'season1', data: TEAM_LOGOS_S1 },
	{ dataset: 'season2', data: TEAM_LOGOS_S2 },
	{ dataset: 'season3', data: TEAM_LOGOS_S3 },
	{ dataset: 'season4', data: TEAM_LOGOS_S3 as unknown[] as TeamLogoData<'season4'>[] },
	{ dataset: 'season5', data: TEAM_LOGOS_S5 as unknown[] as TeamLogoData<'season5'>[] },
	{ dataset: 'season6', data: TEAM_LOGOS_S6 },
	{ dataset: 'owcs-s2', data: TEAM_LOGOS_OWCS_S2 },
] as const;

export function getTeamLogos(dataset: Dataset) {
	return LOGOS.find((l) => l.dataset === dataset)?.data;
}

export function getTeamLogo(dataset: Dataset, teamName: string) {
	return LOGOS.find((l) => l.dataset === dataset)?.data.find((t) => t.teamName === teamName);
}
