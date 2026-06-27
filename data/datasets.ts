import { type CombinedFormattedPlayer, FormattedPlayer, SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { type CombinedLogoData, LOGOS } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import { z } from 'zod';
import { DATASETS, type Dataset, type DatasetMode } from '@/data/datasetIds';
import { DATASET_REGISTRY } from '@/data/registry';
export { DATASETS, type Dataset, type DatasetMode };

export const OWL_PATHNAME = '/owl' as const;
export const OWCS_PATHNAME = '/owcs' as const;
export const ENDLESS_PATHNAME = '/endless' as const;
export const STATISTICS_PATHNAME = '/statistics' as const;
export const STATISTICS_GLOBAL_PATHNAME = '/statistics/global' as const;

export const DEFAULT_DATASET_NAME: Dataset = 'owcs-s3';

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

export type CombinedDatasetMetadata = { [D in Dataset]: DatasetMetadata<D> }[Dataset];

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

export const datasetInfo: BaseDatasetMetadata[] = DATASETS.map((dataset) => {
	const def = DATASET_REGISTRY[dataset];
	return {
		dataset,
		formattedName: def.formattedName,
		name: def.name,
		year: def.year,
		shorthand: def.shorthand,
		league: def.league,
		href: def.href,
		prettyHref: def.prettyHref,
	};
});

export const OWL_DATASETS = datasetInfo.filter((d) => d.league === 'owl');
export const OWCS_DATASETS = datasetInfo.filter((d) => d.league === 'owcs');
export const OWL_DATASETS_REVERSED = OWL_DATASETS.toReversed();
export const OWCS_DATASETS_REVERSED = OWCS_DATASETS.toReversed();
export const DEFAULT_OWCS_DATASET_NAME: Dataset = 'owcs-s3';

export function isOwcsDataset(dataset: Dataset): boolean {
	return datasetInfo.find((d) => d.dataset === dataset)?.league === 'owcs';
}

export const FORMATTED_DATASETS: CombinedDatasetMetadata[] = datasetInfo.map((info) => {
	const playerData = SORTED_PLAYERS.find((p) => p.dataset === info.dataset)?.players;
	const teamData = LOGOS.find((l) => l.dataset === info.dataset)?.data;
	const teams = ALL_TEAMS.find((t) => t.dataset === info.dataset)?.data;
	if (!playerData || !teamData || !teams) {
		throw new Error(
			`Dataset "${info.dataset}" is missing data (players: ${!!playerData}, logos: ${!!teamData}, teams: ${!!teams}). Add it to SORTED_PLAYERS (formattedPlayers.ts), LOGOS (logos.ts), and ALL_TEAMS (teams.ts).`
		);
	}
	return { ...info, playerData, teamData, teams } as CombinedDatasetMetadata;
});

export const DEFAULT_DATASET = FORMATTED_DATASETS[0];

export function getDataset(datasetName: Dataset) {
	return FORMATTED_DATASETS.find((set) => set.dataset === datasetName);
}
