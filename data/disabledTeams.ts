import type { Dataset } from '@/data/datasets';
import type { TeamName } from '@/data/teams/teams';

type DisabledTeamsConfig = { [T in Dataset]: readonly TeamName<T>[] };

// Disabled teams won't be included as answers when the backlog regenerates (use script to remove existing disabled players from backlog).
// They remain valid in endless mode
export const DISABLED_TEAMS_CONFIG: DisabledTeamsConfig = {
	season1: [],
	season2: [],
	season3: [],
	season4: [],
	season5: [],
	season6: [],
	'owcs-s1': [
		'WASPXOHHHHNO',
		'AOneManArmy',
		'ExOblivione',
		'TeamG4mbit',
		'NegMentalAttitude',
		'Hypnos',
		'Metaboiz',
		'Vendetta',
		'TanukiTapire',
		'EXNZenith',
		'Ramattrapunch',
		'Absolution',
		'TeamZ',
		'RadxAvidity',
		'BlastOffBuds',
		'YFPGaming',
	],
	'owcs-s2': [],
	'owcs-s3': ['Cheeseburger', 'PokerFace', 'NewEra', 'DEG', 'HomieE', 'MilkTea', 'NaivePiggy'],
};

// Returns the disabled teams for a dataset as a plain string array for easy `.includes()` checks.
export function getDisabledTeams(dataset: Dataset): readonly string[] {
	return DISABLED_TEAMS_CONFIG[dataset];
}

export function isTeamDisabled(dataset: Dataset, teamName: string): boolean {
	return (DISABLED_TEAMS_CONFIG[dataset] as readonly string[]).includes(teamName);
}
