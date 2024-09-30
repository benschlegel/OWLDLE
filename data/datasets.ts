import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { PLAYERS_S2 } from '@/data/players/players';
import { LOGOS, type TeamLogoData } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import type { GenericPlayer, Player } from '@/types/players';

const datasets = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6'] as const;
export type Dataset = (typeof datasets)[number];

export type DatasetMetadata<T extends Dataset> = {
	dataset: T;
	playerData: GenericPlayer<T>[];
	teamData: TeamLogoData[];
	teams: readonly string[];
	name: string;
	year: string;
	formattedName: string;
	shorthand: string;
};

export type CombinedDatasetMetadata =
	| DatasetMetadata<'season1'>
	| DatasetMetadata<'season2'>
	| DatasetMetadata<'season3'>
	| DatasetMetadata<'season4'>
	| DatasetMetadata<'season5'>
	| DatasetMetadata<'season6'>;

export const DATASETS: CombinedDatasetMetadata[] = [
	{
		dataset: 'season1',
		playerData: PLAYERS_S1,
		teamData: LOGOS[0].data,
		teams: ALL_TEAMS[0].data,
		formattedName: 'Season 1 (2018)',
		name: 'Season 1',
		year: '2018',
		shorthand: 'S1',
	},
	{
		dataset: 'season2',
		playerData: PLAYERS_S2,
		teamData: LOGOS[1].data,
		teams: ALL_TEAMS[1].data,
		formattedName: 'Season 2 (2019)',
		name: 'Season 2',
		year: '2019',
		shorthand: 'S2',
	},
] as const;

export const DEFAULT_DATASET = DATASETS[0];

export function getDataset(datasetName: Dataset) {
	return DATASETS.find((set) => set.dataset === datasetName);
}
