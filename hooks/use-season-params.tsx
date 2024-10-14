'use client';

import { DEFAULT_DATASET_NAME } from '@/data/datasets';
import { createParser, useQueryState } from 'nuqs';

const KEY_NAME = 'season';

export function useSeasonParams() {
	return useQueryState(KEY_NAME, parseSeasons.withDefault(DEFAULT_DATASET_NAME));
}

const parseSeasons = createParser({
	parse(queryValue) {
		return `${KEY_NAME}${queryValue}`;
	},
	serialize(value) {
		return value.slice(KEY_NAME.length);
	},
});
