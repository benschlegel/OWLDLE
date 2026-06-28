'use client';

import { DATASETS, DEFAULT_DATASET_NAME } from '@/data/datasets';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

export function useHistoryParams() {
	return useQueryStates(
		{
			mode: parseAsStringEnum([...DATASETS]).withDefault(DEFAULT_DATASET_NAME),
			iteration: parseAsInteger, // null = no dialog open
			stage: parseAsString, // stage of the open dialog's iteration ('current' | '<N>'); null when none open
			sort: parseAsStringEnum(['iteration', 'winRate', 'played']).withDefault('iteration'),
			order: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
		},
		{ history: 'push', clearOnDefault: true }
	);
}
