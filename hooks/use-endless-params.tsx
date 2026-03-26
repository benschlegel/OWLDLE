'use client';

import { type Dataset, DATASETS, DEFAULT_DATASET_NAME, type DatasetMode } from '@/data/datasets';
import { createParser, useQueryState } from 'nuqs';

const DEFAULT_LEAGUE: DatasetMode = 'owcs';
const DEFAULT_SEASON = 's2';

/**
 * maps mode + season query params to a Dataset name.
 * URL: /endless?mode=owl&season=6 -> dataset "season6"
 * URL: /endless?mode=owcs&season=s2 -> dataset "owcs-s2"
 */
export function useEndlessParams() {
	const [mode] = useQueryState('mode', parseMode.withDefault(DEFAULT_LEAGUE).withOptions({ history: 'push', clearOnDefault: true }));
	const [season] = useQueryState('season', parseSeason.withDefault(DEFAULT_SEASON).withOptions({ history: 'push', clearOnDefault: true }));

	const dataset = modeSeasonToDataset(mode, season);
	return { dataset, mode, season };
}

function modeSeasonToDataset(mode: DatasetMode, season: string): Dataset {
	const candidate = mode === 'owcs' ? `owcs-${season}` : `season${season}`;
	if (DATASETS.includes(candidate as Dataset)) {
		return candidate as Dataset;
	}
	return DEFAULT_DATASET_NAME;
}

const parseMode = createParser<DatasetMode>({
	parse(queryValue) {
		if (queryValue === 'owl' || queryValue === 'owcs') return queryValue;
		return null;
	},
	serialize(value) {
		return value;
	},
});

const parseSeason = createParser<string>({
	parse(queryValue) {
		return queryValue || null;
	},
	serialize(value) {
		return value;
	},
});
