import type { DatasetAnswer } from '@/app/api/validate/route';
import type { Dataset } from '@/data/datasets';
import type { ValidateResponse } from '@/types/server';
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PersistedClient } from '@tanstack/react-query-persist-client';
import { useEffect, useRef, useState } from 'react';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };

const ITERATION_KEY = 'latestIteration';
export const LOCAL_STORAGE_STALE_KEY = 'isStale';
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const QUERY_KEY = 'all';

export type FetchResult = {
	data: DatasetValidatedResponse[];
	nextReset: Date;
	iteration: number;
};

async function fetchValidateDataset(): Promise<FetchResult> {
	const response = await fetch('/api/validate?dataset=all');
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	console.log('Fetched new dataset.');
	const res = (await response.json()) as Required<DatasetAnswer>[];
	const formatted: DatasetValidatedResponse[] = res.map((r) => ({
		dataset: r.dataset,
		answer: { correctPlayer: r.answer.player, iteration: r.answer.iteration, nextReset: r.answer.nextReset },
	}));

	// TODO: just save iteration to localStorage here and cross reference, set isStale if newer

	return { data: formatted, nextReset: formatted[0].answer.nextReset, iteration: formatted[0].answer.iteration };
}

export function useAnswerQuery(dataset: Dataset) {
	const initialFetchRef = useRef(false);
	// TODO: rev saying if query was old, also return that
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: [QUERY_KEY],
		queryFn: fetchValidateDataset,
		select: (result) => {
			const found = result.data.find((item) => item.dataset === dataset)?.answer ?? result.data[0].answer;
			return found;
		},
		staleTime: (data) => {
			if (data.state.data) {
				const nextReset = new Date(data.state.data.nextReset).getTime();
				const now = Date.now();
				const staleTime = Math.max(0, nextReset - now);
				return staleTime;
			}
			return 0;
		},
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!initialFetchRef.current && query.data) {
			initialFetchRef.current = true;
			const currentIteration = query.data.iteration;

			// Check if there's persisted data and update the iteration
			const persistedCache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
			if (persistedCache) {
				try {
					const cache = JSON.parse(persistedCache) as PersistedClient;
					const queries = cache.clientState.queries;
					const latestQuery = queries[queries.length - 1];
					const storedData = latestQuery.state.data as FetchResult;

					if (currentIteration > storedData.iteration) {
						localStorage.setItem(LOCAL_STORAGE_STALE_KEY, 'true');
						queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
					}
				} catch (error) {
					console.error('Error parsing persisted cache:', error);
				}
			}
		}
	}, [query.data, queryClient.invalidateQueries]);

	return query;
}
