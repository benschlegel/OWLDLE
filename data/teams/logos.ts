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

export const TEAM_LOGOS_S1: TeamLogoData[] = teamLogosS1.map(
	(team) => ({ ...team, imgUrl: `/teams/s1/${team.teamName}.${GAME_CONFIG.teamLogoImgExtension}` }) as TeamLogoData
);

// Add new logos and combine with old ones for full season 2 team logos
const logosS2: TeamLogoData[] = teamLogosS2.map(
	(team) => ({ ...team, imgUrl: `/teams/s2/${team.teamName}.${GAME_CONFIG.teamLogoImgExtension}` }) as TeamLogoData
);
const TEAM_LOGOS_S2: TeamLogoData[] = [...TEAM_LOGOS_S1, ...logosS2];

type LogoData = {
	dataset: Dataset;
	data: TeamLogoData[];
};

export const LOGOS: LogoData[] = [
	{ dataset: 'season1', data: TEAM_LOGOS_S1 },
	{ dataset: 'season2', data: TEAM_LOGOS_S2 },
];

export function getTeamLogos(dataset: Dataset) {
	return LOGOS.find((l) => l.dataset === dataset)?.data;
}

export function getTeamLogo(dataset: Dataset, teamName: string) {
	return LOGOS.find((l) => l.dataset === dataset)?.data.find((t) => t.teamName === teamName);
}
