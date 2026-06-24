'use client';

import { DATASETS, DEFAULT_DATASET_NAME } from '@/data/datasets';
import { TIMEFRAME_RANGES } from '@/types/statistics';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

export function useStatisticsParams() {
	return useQueryStates(
		{
			dataset: parseAsStringEnum([...DATASETS]).withDefault(DEFAULT_DATASET_NAME),
			range: parseAsStringEnum([...TIMEFRAME_RANGES]).withDefault('yesterday'),
			from: parseAsString,
			to: parseAsString,
		},
		{ history: 'push', clearOnDefault: true }
	);
}
