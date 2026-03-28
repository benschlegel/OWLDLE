'use client';

import { type Dataset, DEFAULT_OWCS_DATASET_NAME, OWCS_DATASETS } from '@/data/datasets';
import { createParser, useQueryState } from 'nuqs';

const KEY_NAME = 'season';

const DATASET_PREFIX = 'owcs';
export function useOwcsParams() {
	return useQueryState(KEY_NAME, parseOwcsSeasons.withDefault(DEFAULT_OWCS_DATASET_NAME).withOptions({ history: 'push', clearOnDefault: true }));
}

const parseOwcsSeasons = createParser<Dataset>({
	parse(queryValue) {
		const candidate = `${DATASET_PREFIX}-${queryValue}` as Dataset;
		return OWCS_DATASETS.some((d) => d.dataset === candidate) ? candidate : null;
	},
	serialize(value) {
		return trimPrefix(value);
	},
});

function trimPrefix(value: string) {
	return value.slice(`${DATASET_PREFIX}-`.length);
}
