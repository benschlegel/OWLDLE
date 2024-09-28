import { PLAYERS } from '@/data/players/formattedPlayers';
import { TEAM_LOGOS_S1, type TeamLogoData } from '@/data/teams/logos';
import { TEAMS } from '@/data/teams/teams';

const datasets = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6'] as const;
export type Dataset = (typeof datasets)[number];

export type DatasetMetadata = {
	dataset: Dataset;
	playerData: unknown[];
	teamData: TeamLogoData[];
	teams: string[];
	name: string;
	year: string;
	formattedName: string;
};

export const Datasets: DatasetMetadata[] = [
	{ dataset: 'season1', playerData: PLAYERS, teamData: TEAM_LOGOS_S1, teams: TEAMS, formattedName: 'Season 1 (2018)', name: 'Season 1', year: '2018' },
	{ dataset: 'season2', playerData: PLAYERS, teamData: TEAM_LOGOS_S1, teams: TEAMS, formattedName: 'Season 2 (2019)', name: 'Season 2', year: '2019' },
];
