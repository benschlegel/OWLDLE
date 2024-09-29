import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { TEAM_LOGOS_S1, type TeamLogoData } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import type { Player } from '@/types/players';

const datasets = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6'] as const;
export type Dataset = (typeof datasets)[number];

export type DatasetMetadata = {
	dataset: Dataset;
	playerData: Player[];
	teamData: TeamLogoData[];
	teams: readonly string[];
	name: string;
	year: string;
	formattedName: string;
	shorthand: string;
};

export const DATASETS: DatasetMetadata[] = [
	{
		dataset: 'season1',
		playerData: PLAYERS_S1,
		teamData: TEAM_LOGOS_S1,
		teams: ALL_TEAMS[0].data,
		formattedName: 'Season 1 (2018)',
		name: 'Season 1',
		year: '2018',
		shorthand: 'S1',
	},
	{
		dataset: 'season2',
		playerData: [PLAYERS_S1[0], PLAYERS_S1[3], PLAYERS_S1[4], PLAYERS_S1[5]],
		teamData: TEAM_LOGOS_S1,
		teams: ALL_TEAMS[1].data,
		formattedName: 'Season 2 (2019)',
		name: 'Season 2',
		year: '2019',
		shorthand: 'S2',
	},
];

export const DEFAULT_DATASET = DATASETS[0];

export function getDataset(datasetName: Dataset) {
	return DATASETS.find((set) => set.dataset === datasetName);
}
