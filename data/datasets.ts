import { type CombinedFormattedPlayer, FormattedPlayer, SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { s2Players } from '@/data/players/players';
import { type CombinedLogoData, LOGOS } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import { z } from 'zod';

export const DATASETS = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6'] as const;
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
	| DatasetMetadata<'season6'>;

export const FORMATTED_DATASETS: CombinedDatasetMetadata[] = [
	{
		dataset: 'season1',
		playerData: SORTED_PLAYERS[0].players,
		teamData: LOGOS[0].data,
		teams: ALL_TEAMS[0].data,
		formattedName: 'Season 1 (2018)',
		name: 'Season 1',
		year: '2018',
		shorthand: 'S1',
	},
	{
		dataset: 'season2',
		playerData: SORTED_PLAYERS[1].players,
		teamData: LOGOS[1].data,
		teams: ALL_TEAMS[1].data,
		formattedName: 'Season 2 (2019)',
		name: 'Season 2',
		year: '2019',
		shorthand: 'S2',
	},
] as const;

export const DEFAULT_DATASET = FORMATTED_DATASETS[0];

export function getDataset(datasetName: Dataset) {
	return FORMATTED_DATASETS.find((set) => set.dataset === datasetName);
}
