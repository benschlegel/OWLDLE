import type { DatasetAnswer } from '@/app/api/validate/route';
import type { Dataset } from '@/data/datasets';
import type { ValidateResponse } from '@/types/server';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };

const LOCAL_STORAGE_ITERATION_KEY = 'latestIteration';
export const LOCAL_STORAGE_STALE_KEY = 'isStale';
export const QUERY_KEY = 'all';

export type FetchResult = {
	data: DatasetValidatedResponse[];
	isStale: boolean;
};

const defaultDatasetIndex = 1;

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

	let isStale = false;

	if (typeof window !== 'undefined') {
		const lastIteration = localStorage.getItem(LOCAL_STORAGE_ITERATION_KEY);
		const newIteration = formatted[defaultDatasetIndex].answer.iteration;
		console.log('New iteration: ', newIteration);
		if (lastIteration) {
			// If new answer iteration is higher, mark data as stale and set new latestIteration key
			if (newIteration > Number.parseInt(lastIteration)) {
				isStale = true;
				console.log('Writing iteration (stale): ', newIteration);
				localStorage.setItem(LOCAL_STORAGE_ITERATION_KEY, newIteration.toString());
			}
		} else {
			// Set entry if it does not exist yet
			console.log('Writing iteration (not existing): ', newIteration);
			localStorage.setItem(LOCAL_STORAGE_ITERATION_KEY, newIteration.toString());
		}
	}

	return { data: formatted, isStale };
}

export function useAnswerQuery(dataset: Dataset) {
	const isStaleRef = useRef(false);
	const query = useQuery({
		queryKey: [QUERY_KEY],
		queryFn: async () => {
			const data = await fetchValidateDataset();
			isStaleRef.current = data.isStale;
			return data;
		},
		select: (result) => {
			const found = result.data.find((item) => item.dataset === dataset)?.answer ?? result.data[0].answer;
			return found;
		},
		staleTime: 60 * 60 * 1000, // 6 hours, gets reset at reload
		refetchOnWindowFocus: false,
	});

	return { data: query.data, isStale: isStaleRef };
}
