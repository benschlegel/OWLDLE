import { DATASETS, getDataset, datasetInfo } from '@/data/datasets';
import { SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { LOGOS } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import { DISABLED_TEAMS_CONFIG, getDisabledTeams } from '@/data/disabledTeams';
import { ENDLESS_FILTER_CONFIGS } from '@/data/endless-filter-config';
import { DATASET_REGISTRY } from '@/data/registry';

/**
 * Validates the integrity of dataset structures that are assembled by parallel
 * array index in data/datasets.ts.An empty array means everything is consistent.
 */
export function validateDatasetIntegrity(): string[] {
	const problems: string[] = [];

	// Check 1: Every dataset is present in every parallel structure, and
	// DISABLED_TEAMS_CONFIG has an entry for every dataset.
	for (const d of DATASETS) {
		const playerCount = SORTED_PLAYERS.filter((p) => p.dataset === d).length;
		if (playerCount === 0) {
			problems.push(`dataset "${d}": no entry found in SORTED_PLAYERS`);
		} else if (playerCount > 1) {
			problems.push(`dataset "${d}": duplicate entries in SORTED_PLAYERS (found ${playerCount})`);
		}

		const logoCount = LOGOS.filter((l) => l.dataset === d).length;
		if (logoCount === 0) {
			problems.push(`dataset "${d}": no entry found in LOGOS`);
		} else if (logoCount > 1) {
			problems.push(`dataset "${d}": duplicate entries in LOGOS (found ${logoCount})`);
		}

		const teamCount = ALL_TEAMS.filter((t) => t.dataset === d).length;
		if (teamCount === 0) {
			problems.push(`dataset "${d}": no entry found in ALL_TEAMS`);
		} else if (teamCount > 1) {
			problems.push(`dataset "${d}": duplicate entries in ALL_TEAMS (found ${teamCount})`);
		}

		if (!(d in DISABLED_TEAMS_CONFIG)) {
			problems.push(`dataset "${d}": no entry found in DISABLED_TEAMS_CONFIG`);
		}
	}

	// Check 2: No extra entries, each parallel array has exactly DATASETS.length entries.
	if (SORTED_PLAYERS.length !== DATASETS.length) {
		problems.push(`SORTED_PLAYERS has ${SORTED_PLAYERS.length} entries but DATASETS has ${DATASETS.length}`);
	}
	if (LOGOS.length !== DATASETS.length) {
		problems.push(`LOGOS has ${LOGOS.length} entries but DATASETS has ${DATASETS.length}`);
	}
	if (ALL_TEAMS.length !== DATASETS.length) {
		problems.push(`ALL_TEAMS has ${ALL_TEAMS.length} entries but DATASETS has ${DATASETS.length}`);
	}

	// Check 3: getDataset is defined for every dataset.
	for (const d of DATASETS) {
		if (getDataset(d) === undefined) {
			problems.push(`dataset "${d}": getDataset() returned undefined`);
		}
	}

	// Check 4: The index-assembled consumed mapping matches the name-keyed mapping.
	for (const d of DATASETS) {
		const consumed = getDataset(d);
		if (!consumed) continue; // already reported above

		const nameKeyedPlayers = SORTED_PLAYERS.find((p) => p.dataset === d);
		const nameKeyedTeams = ALL_TEAMS.find((t) => t.dataset === d);
		const nameKeyedLogos = LOGOS.find((l) => l.dataset === d);

		if (nameKeyedPlayers) {
			const consumedNames = consumed.playerData.map((p) => p.name);
			const keyedNames = nameKeyedPlayers.players.map((p) => p.name);
			if (JSON.stringify(consumedNames) !== JSON.stringify(keyedNames)) {
				problems.push(
					`dataset "${d}": FORMATTED_DATASETS playerData (assembled by index) does not match SORTED_PLAYERS[dataset="${d}"] (name-keyed), index-ordering drift detected`
				);
			}
		}

		if (nameKeyedTeams) {
			const consumedTeams = [...consumed.teams];
			const keyedTeams = [...nameKeyedTeams.data];
			if (JSON.stringify(consumedTeams) !== JSON.stringify(keyedTeams)) {
				problems.push(
					`dataset "${d}": FORMATTED_DATASETS teams (assembled by index) does not match ALL_TEAMS[dataset="${d}"] (name-keyed), index-ordering drift detected`
				);
			}
		}

		if (nameKeyedLogos) {
			const consumedLogoNames = consumed.teamData.map((l) => l.teamName);
			const keyedLogoNames = nameKeyedLogos.data.map((l) => l.teamName);
			if (JSON.stringify(consumedLogoNames) !== JSON.stringify(keyedLogoNames)) {
				problems.push(
					`dataset "${d}": FORMATTED_DATASETS teamData (assembled by index) does not match LOGOS[dataset="${d}"] (name-keyed), index-ordering drift detected`
				);
			}
		}
	}

	// Check 5: Every player's team exists in its dataset's team list.
	for (const d of DATASETS) {
		const teamEntry = ALL_TEAMS.find((t) => t.dataset === d);
		const teamList = teamEntry ? (teamEntry.data as readonly string[]) : [];
		const playerEntry = SORTED_PLAYERS.find((p) => p.dataset === d);
		if (!playerEntry) continue;
		for (const player of playerEntry.players) {
			if (!teamList.includes(player.team as string)) {
				problems.push(`dataset "${d}": player "${player.name}" has team "${player.team}" not in ALL_TEAMS[${d}]`);
			}
		}
	}

	// Check 6: Every logo's team exists in its dataset's team list.
	for (const d of DATASETS) {
		const teamEntry = ALL_TEAMS.find((t) => t.dataset === d);
		const teamList = teamEntry ? (teamEntry.data as readonly string[]) : [];
		const logoEntry = LOGOS.find((l) => l.dataset === d);
		if (!logoEntry) continue;
		for (const logo of logoEntry.data) {
			if (!teamList.includes(logo.teamName as string)) {
				problems.push(`dataset "${d}": logo for team "${logo.teamName}" not in ALL_TEAMS[${d}]`);
			}
		}
	}

	// Check 7: Every disabled team exists in its dataset's team list.
	for (const d of DATASETS) {
		const teamEntry = ALL_TEAMS.find((t) => t.dataset === d);
		const teamList = teamEntry ? (teamEntry.data as readonly string[]) : [];
		for (const disabledTeam of getDisabledTeams(d)) {
			if (!teamList.includes(disabledTeam)) {
				problems.push(`dataset "${d}": disabled team "${disabledTeam}" not in ALL_TEAMS[${d}]`);
			}
		}
	}

	// Check 8: Every endless-filter team reference is valid.
	for (const d of DATASETS) {
		const filterConfig = ENDLESS_FILTER_CONFIGS[d];
		if (!filterConfig?.topTeamsFilter?.teams) continue;
		const teamEntry = ALL_TEAMS.find((t) => t.dataset === d);
		const teamList = teamEntry ? (teamEntry.data as readonly string[]) : [];
		for (const team of filterConfig.topTeamsFilter.teams) {
			if (!teamList.includes(team)) {
				problems.push(`dataset "${d}": endless-filter topTeamsFilter team "${team}" not in ALL_TEAMS[${d}]`);
			}
		}
	}

	// Check 9: datasetInfo derivation matches DATASET_REGISTRY values.
	for (const d of DATASETS) {
		const info = datasetInfo.find((i) => i.dataset === d);
		if (info && info.formattedName !== DATASET_REGISTRY[d].formattedName) {
			problems.push(
				`dataset "${d}": datasetInfo.formattedName ("${info.formattedName}") does not match DATASET_REGISTRY formattedName ("${DATASET_REGISTRY[d].formattedName}")`
			);
		}
	}

	return problems;
}
