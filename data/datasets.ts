import { type CombinedFormattedPlayer, FormattedPlayer, SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { s2Players } from '@/data/players/players';
import { type CombinedLogoData, LOGOS } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import { z } from 'zod';

export const DEFAULT_DATASET_NAME: Dataset = 'season6';
export const DATASETS = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'owcs-s2'] as const;
export type Dataset = (typeof DATASETS)[number];

export const datasetSchema = z.enum(DATASETS);
export type DatasetMetadata<T extends Dataset> = {
	dataset: T;
	playerData: CombinedFormattedPlayer[];
	teamData: CombinedLogoData['data'];
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
	| DatasetMetadata<'season6'>
	| DatasetMetadata<'owcs-s2'>;

type BaseDatasetMetadata = {
	dataset: Dataset;
	formattedName: string;
	name: string;
	year: string;
	shorthand: string;
};

export const datasetInfo: BaseDatasetMetadata[] = [
	{
		dataset: 'season1',
		formattedName: 'Season 1 (2018)',
		name: 'Season 1',
		year: '2018',
		shorthand: 'S1',
	},
	{
		dataset: 'season2',
		formattedName: 'Season 2 (2019)',
		name: 'Season 2',
		year: '2019',
		shorthand: 'S2',
	},
	{
		dataset: 'season3',
		formattedName: 'Season 3 (2020)',
		name: 'Season 3',
		year: '2020',
		shorthand: 'S3',
	},
	{
		dataset: 'season4',
		formattedName: 'Season 4 (2021)',
		name: 'Season 4',
		year: '2021',
		shorthand: 'S4',
	},
	{
		dataset: 'season5',
		formattedName: 'Season 5 (2022)',
		name: 'Season 5',
		year: '2022',
		shorthand: 'S5',
	},
	{
		dataset: 'season6',
		formattedName: 'Season 6 (2023)',
		name: 'Season 6',
		year: '2023',
		shorthand: 'S6',
	},
	{
		dataset: 'owcs-s2',
		formattedName: 'OWCS S2 (2025)',
		name: 'OWCS S2',
		year: '2025',
		shorthand: 'owcs',
	},
] as const;

export const FORMATTED_DATASETS: CombinedDatasetMetadata[] = datasetInfo.map(
	(dataset, index) =>
		({ ...dataset, playerData: SORTED_PLAYERS[index].players, teamData: LOGOS[index].data, teams: ALL_TEAMS[index].data }) as CombinedDatasetMetadata
);

export const DEFAULT_DATASET = FORMATTED_DATASETS[0];

export function getDataset(datasetName: Dataset) {
	return FORMATTED_DATASETS.find((set) => set.dataset === datasetName);
}
