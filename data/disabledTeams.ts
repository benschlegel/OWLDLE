import { DATASETS, type Dataset } from '@/data/datasetIds';
import { DATASET_REGISTRY } from '@/data/registry';
import type { TeamName } from '@/data/teams/teams';

type DisabledTeamsConfig = { [T in Dataset]: readonly TeamName<T>[] };

// Disabled teams won't be included as answers when the backlog regenerates (use script to remove existing disabled players from backlog).
// They remain valid in endless mode
export const DISABLED_TEAMS_CONFIG: DisabledTeamsConfig = Object.fromEntries(
	DATASETS.map((d) => [d, DATASET_REGISTRY[d].disabledTeams])
) as DisabledTeamsConfig;

// Returns the disabled teams for a dataset as a plain string array for easy `.includes()` checks.
export function getDisabledTeams(dataset: Dataset): readonly string[] {
	return DISABLED_TEAMS_CONFIG[dataset];
}

export function isTeamDisabled(dataset: Dataset, teamName: string): boolean {
	return (DISABLED_TEAMS_CONFIG[dataset] as readonly string[]).includes(teamName);
}
