'use client';

import { DATASETS, DEFAULT_DATASET_NAME } from '@/data/datasets';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

export function useHistoryParams() {
	return useQueryStates(
		{
			mode: parseAsStringEnum([...DATASETS]).withDefault(DEFAULT_DATASET_NAME),
			iteration: parseAsInteger, // null = no dialog open
		},
		{ history: 'push', clearOnDefault: true }
	);
}
