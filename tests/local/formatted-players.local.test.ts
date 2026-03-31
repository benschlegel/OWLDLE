import { FORMATTED_PLAYERS } from '@/data/players/formattedPlayers';
import { DATASETS, type Dataset } from '@/data/datasets';
import { ALL_TEAMS } from '@/data/teams/teams';
import { describe, test, expect } from 'vitest';

const VALID_ROLES = ['Damage', 'Tank', 'Support'] as const;
const OWL_REGIONS = ['AtlanticDivison', 'PacificDivision'] as const;
const OWCS_REGIONS = ['EMEA', 'NA', 'Korea', 'CN'] as const;
const ALL_REGIONS = [...OWL_REGIONS, ...OWCS_REGIONS] as const;
const OWL_DATASETS: Dataset[] = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6'];
const OWCS_DATASETS: Dataset[] = ['owcs-s1', 'owcs-s2', 'owcs-s3'];

test('FORMATTED_PLAYERS contains all datasets', () => {
	const formattedDatasets = FORMATTED_PLAYERS.map((d) => d.dataset);
	for (const ds of DATASETS) {
		expect(formattedDatasets, `missing dataset: ${ds}`).toContain(ds);
	}
	expect(FORMATTED_PLAYERS).toHaveLength(DATASETS.length);
});

describe.each(FORMATTED_PLAYERS)('dataset: $dataset', ({ dataset, players }) => {
	const validTeams = ALL_TEAMS.find((t) => t.dataset === dataset)?.data ?? [];
	const isOwcs = OWCS_DATASETS.includes(dataset);

	test('has at least one player', () => {
		expect(players.length).toBeGreaterThan(0);
	});

	test('player IDs are unique and sequential', () => {
		const ids = players.map((p) => p.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(players.length);
		// IDs should correspond to original array indices (0-based)
		const sorted = [...ids].sort((a, b) => a - b);
		expect(sorted[0]).toBe(0);
		expect(sorted[sorted.length - 1]).toBe(players.length - 1);
	});

	test('player name+team combinations are unique within the dataset', () => {
		const keys = players.map((p) => `${p.name}|${p.team}`);
		const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i).map((k) => k.replace('|', ' @ '));
		expect(duplicates, `duplicate name+team: ${duplicates.join(', ')}`).toHaveLength(0);
	});

	test('every player has a valid role', () => {
		for (const player of players) {
			expect(player.role, `${player.name}: role is undefined`).toBeDefined();
			expect(VALID_ROLES, `${player.name}: invalid role "${player.role}"`).toContain(player.role);
		}
	});

	test('every player has a valid team for the dataset', () => {
		for (const player of players) {
			expect(player.team, `${player.name}: team is undefined`).toBeDefined();
			expect(player.team, `${player.name}: team is empty`).not.toBe('');
			expect(validTeams as readonly string[], `${player.name}: team "${player.team}" not valid for ${dataset}`).toContain(player.team);
		}
	});

	test('every player has a valid region', () => {
		for (const player of players) {
			expect(player.region, `${player.name}: region is undefined`).toBeDefined();
			expect(ALL_REGIONS as readonly string[], `${player.name}: invalid region "${player.region}"`).toContain(player.region);
		}
	});

	if (!isOwcs) {
		test('OWL players only have OWL regions (AtlanticDivison or PacificDivision)', () => {
			for (const player of players) {
				expect(OWL_REGIONS as readonly string[], `${player.name}: OWL player has non-OWL region "${player.region}"`).toContain(player.region);
			}
		});
	} else {
		test('OWCS players only have OWCS regions (EMEA, NA, Korea, CN)', () => {
			for (const player of players) {
				expect(OWCS_REGIONS as readonly string[], `${player.name}: OWCS player has non-OWCS region "${player.region}"`).toContain(player.region);
			}
		});
	}

	test('every player has a non-empty countryImg', () => {
		for (const player of players) {
			expect(player.countryImg, `${player.name}: countryImg is undefined`).toBeDefined();
			expect(player.countryImg, `${player.name}: countryImg is empty`).not.toBe('');
		}
	});

	test('every player has a non-empty name', () => {
		for (const player of players) {
			expect(player.name).toBeDefined();
			expect(player.name.length).toBeGreaterThanOrEqual(2);
			expect(player.name.length).toBeLessThanOrEqual(32);
		}
	});

	test('every player has a non-empty country code', () => {
		for (const player of players) {
			expect(player.country, `${player.name}: country is undefined`).toBeDefined();
			expect(player.country, `${player.name}: country is empty`).not.toBe('');
		}
	});
});
