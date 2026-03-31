import { type CombinedFormattedPlayer, FormattedPlayer, SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { s2Players } from '@/data/players/players';
import { type CombinedLogoData, LOGOS } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import { z } from 'zod';

export const OWL_PATHNAME = '/owl' as const;
export const OWCS_PATHNAME = '/owcs' as const;
export const ENDLESS_PATHNAME = '/endless' as const;
export const STATISTICS_PATHNAME = '/statistics' as const;

export const DEFAULT_DATASET_NAME: Dataset = 'season6';
export const DATASETS = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'owcs-s1', 'owcs-s2', 'owcs-s3'] as const;
export type Dataset = (typeof DATASETS)[number];
export type DatasetMode = 'owl' | 'owcs';

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
	league: DatasetMode;
	href: string;
	prettyHref: string;
};

export type CombinedDatasetMetadata =
	| DatasetMetadata<'season1'>
	| DatasetMetadata<'season2'>
	| DatasetMetadata<'season3'>
	| DatasetMetadata<'season4'>
	| DatasetMetadata<'season5'>
	| DatasetMetadata<'season6'>
	| DatasetMetadata<'owcs-s1'>
	| DatasetMetadata<'owcs-s2'>
	| DatasetMetadata<'owcs-s3'>;

type BaseDatasetMetadata = {
	dataset: Dataset;
	formattedName: string;
	name: string;
	year: string;
	shorthand: string;
	league: DatasetMode;
	href: string;
	/** Clean URL path used for share links (e.g. "/owl/season6" -> "owl?season=6", "/owcs/season2" -> "/owcs?season=s2"), resolves via redirect */
	prettyHref: string;
};

export const datasetInfo: BaseDatasetMetadata[] = [
	{
		dataset: 'season1',
		formattedName: 'Season 1 (2018)',
		name: 'Season 1',
		year: '2018',
		shorthand: 'S1',
		league: 'owl',
		href: 'owl?season=1',
		prettyHref: '/owl/season1',
	},
	{
		dataset: 'season2',
		formattedName: 'Season 2 (2019)',
		name: 'Season 2',
		year: '2019',
		shorthand: 'S2',
		league: 'owl',
		href: 'owl?season=2',
		prettyHref: '/owl/season2',
	},
	{
		dataset: 'season3',
		formattedName: 'Season 3 (2020)',
		name: 'Season 3',
		year: '2020',
		shorthand: 'S3',
		league: 'owl',
		href: 'owl?season=3',
		prettyHref: '/owl/season3',
	},
	{
		dataset: 'season4',
		formattedName: 'Season 4 (2021)',
		name: 'Season 4',
		year: '2021',
		shorthand: 'S4',
		league: 'owl',
		href: 'owl?season=4',
		prettyHref: '/owl/season4',
	},
	{
		dataset: 'season5',
		formattedName: 'Season 5 (2022)',
		name: 'Season 5',
		year: '2022',
		shorthand: 'S5',
		league: 'owl',
		href: 'owl?season=5',
		prettyHref: '/owl/season5',
	},
	{
		dataset: 'season6',
		formattedName: 'Season 6 (2023)',
		name: 'Season 6',
		year: '2023',
		shorthand: 'S6',
		league: 'owl',
		href: 'owl?season=6',
		prettyHref: '/owl/season6',
	},
	{
		dataset: 'owcs-s1',
		formattedName: 'OWCS S1 (2024)',
		name: 'OWCS S1',
		year: '2024',
		shorthand: 'S1',
		league: 'owcs',
		href: 'owcs?season=s1',
		prettyHref: '/owcs/season1',
	},
	{
		dataset: 'owcs-s2',
		formattedName: 'OWCS S2 (2025)',
		name: 'OWCS S2',
		year: '2025',
		shorthand: 'S2',
		league: 'owcs',
		href: 'owcs?season=s2',
		prettyHref: '/owcs/season2',
	},
	{
		dataset: 'owcs-s3',
		formattedName: 'OWCS S3 (2026)',
		name: 'OWCS S3',
		year: '2026',
		shorthand: 'S3',
		league: 'owcs',
		href: 'owcs?season=s3',
		prettyHref: '/owcs/season3',
	},
] as const;

export const OWL_DATASETS = datasetInfo.filter((d) => d.league === 'owl');
export const OWCS_DATASETS = datasetInfo.filter((d) => d.league === 'owcs');
export const OWL_DATASETS_REVERSED = OWL_DATASETS.toReversed();
export const OWCS_DATASETS_REVERSED = OWCS_DATASETS.toReversed();
export const DEFAULT_OWCS_DATASET_NAME: Dataset = 'owcs-s3';

export function isOwcsDataset(dataset: Dataset): boolean {
	return datasetInfo.find((d) => d.dataset === dataset)?.league === 'owcs';
}

export const FORMATTED_DATASETS: CombinedDatasetMetadata[] = datasetInfo.map(
	(dataset, index) =>
		({ ...dataset, playerData: SORTED_PLAYERS[index].players, teamData: LOGOS[index].data, teams: ALL_TEAMS[index].data }) as CombinedDatasetMetadata
);

export const DEFAULT_DATASET = FORMATTED_DATASETS[0];

export function getDataset(datasetName: Dataset) {
	return FORMATTED_DATASETS.find((set) => set.dataset === datasetName);
}
