import type { Dataset } from '@/data/datasets';
import { DISABLED_TEAMS_CONFIG } from '@/data/disabledTeams';
import { ALL_TEAMS, PARTNERED_TEAMS_OWCS_S3 } from '@/data/teams/teams';

export type DatasetFilterConfig = {
	/** Regions available for toggle filtering. Omit if dataset has no region filter. */
	regions?: readonly string[];
	/** Toggle to restrict the player pool to specific teams. */
	topTeamsFilter?: {
		label: string;
		teams: readonly string[];
	};
};

function getNonDisabledTeams(dataset: Dataset): readonly string[] {
	const allTeams = ALL_TEAMS.find((t) => t.dataset === dataset)?.data ?? [];
	const disabled = new Set(DISABLED_TEAMS_CONFIG[dataset] as readonly string[]);
	return allTeams.filter((t) => !disabled.has(t));
}

export const ENDLESS_FILTER_CONFIGS: Partial<Record<Dataset, DatasetFilterConfig>> = {
	'owcs-s3': {
		regions: ['EMEA', 'NA', 'Korea', 'CN'],
		topTeamsFilter: {
			label: 'Partner teams only',
			teams: PARTNERED_TEAMS_OWCS_S3,
		},
	},
	'owcs-s1': {
		topTeamsFilter: {
			label: 'Top 8 teams only',
			teams: getNonDisabledTeams('owcs-s1'),
		},
	},
};

export function getDatasetFilterConfig(dataset: Dataset): DatasetFilterConfig | undefined {
	return ENDLESS_FILTER_CONFIGS[dataset];
}

export function hasEndlessFilters(dataset: Dataset): boolean {
	const config = ENDLESS_FILTER_CONFIGS[dataset];
	return !!config && (!!config.regions?.length || !!config.topTeamsFilter);
}
