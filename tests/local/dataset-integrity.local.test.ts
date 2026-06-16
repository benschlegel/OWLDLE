import { validateDatasetIntegrity } from '@/data/datasetIntegrity';
import { DATASETS, getDataset, datasetInfo } from '@/data/datasets';
import { SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { LOGOS } from '@/data/teams/logos';
import { ALL_TEAMS } from '@/data/teams/teams';
import { describe, test, expect } from 'vitest';

test('validateDatasetIntegrity() returns no problems on the unmodified dataset', () => {
	const problems = validateDatasetIntegrity();
	expect(problems, `dataset integrity violations:\n${problems.join('\n')}`).toEqual([]);
});

test('parallel arrays have the same length as DATASETS', () => {
	expect(SORTED_PLAYERS, `SORTED_PLAYERS length mismatch`).toHaveLength(DATASETS.length);
	expect(LOGOS, `LOGOS length mismatch`).toHaveLength(DATASETS.length);
	expect(ALL_TEAMS, `ALL_TEAMS length mismatch`).toHaveLength(DATASETS.length);
});

test('datasetInfo order matches DATASETS order', () => {
	expect(datasetInfo.map((d) => d.dataset)).toEqual([...DATASETS]);
});

describe.each(DATASETS)('dataset: %s', (d) => {
	test('getDataset() is defined', () => {
		expect(getDataset(d), `getDataset("${d}") returned undefined`).toBeDefined();
	});

	test('getDataset().dataset matches the key', () => {
		const entry = getDataset(d);
		expect(entry?.dataset, `getDataset("${d}").dataset !== "${d}"`).toBe(d);
	});
});
