import type { DatasetAnswer } from '@/app/api/validate/route';
import type { Dataset } from '@/data/datasets';
import type { ValidateResponse } from '@/types/server';
import { useQuery } from '@tanstack/react-query';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };

const LOCAL_STORAGE_LATEST_ITERATION = 'latestIteration';
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const LOCAL_STORAGE_STALE_KEY = 'isStale';

async function fetchValidateDataset() {
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

	const nextReset = formatted[0].answer.nextReset;
	const currentTime = new Date().getTime();
	const resetTime = nextReset ? new Date(nextReset).getTime() : currentTime + DEFAULT_STALE_TIME;
	const timeUntilReset = Math.max(resetTime - currentTime, 0);

	// Update highest iteration
	const highestIteration = Math.max(...formatted.map((item) => item.answer.iteration));
	localStorage.setItem(LOCAL_STORAGE_LATEST_ITERATION, highestIteration.toString());

	console.log(`Cache will persist for ${timeUntilReset / 1000} seconds.`);

	return { data: formatted, timeUntilReset, fetchedAt: currentTime };
}

export function useAnswerQuery(dataset: Dataset) {
	return useQuery({
		queryKey: ['all'],
		queryFn: () => fetchValidateDataset(),
		select: (result: { data: DatasetValidatedResponse[]; timeUntilReset: number; fetchedAt: number }) => {
			const found = result.data.find((item) => item.dataset === dataset)?.answer ?? result.data[0].answer;
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - result.fetchedAt;

			// Check if data is stale
			const isStale = elapsedTime >= (result.timeUntilReset ?? DEFAULT_STALE_TIME);

			// Set localStorage key if data is stale on initial load
			if (isStale) {
				localStorage.setItem(LOCAL_STORAGE_STALE_KEY, 'true');
			} else {
				localStorage.removeItem(LOCAL_STORAGE_STALE_KEY);
			}

			return { ...found, fetchedAt: result.fetchedAt, timeUntilReset: result.timeUntilReset };
		},
		staleTime: (oldData) => {
			if (!oldData?.state?.data) return DEFAULT_STALE_TIME;
			const timeUntilReset = oldData.state.data.timeUntilReset ?? DEFAULT_STALE_TIME;
			const fetchedAt = oldData.state.data.fetchedAt ?? Date.now();
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - fetchedAt;
			return Math.max(timeUntilReset - elapsedTime, 0);
		},
		refetchInterval: (data) => {
			if (!data) return DEFAULT_STALE_TIME;
			const timeUntilReset = data.state.data?.timeUntilReset ?? DEFAULT_STALE_TIME;
			const fetchedAt = data.state.data?.fetchedAt ?? Date.now();
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - fetchedAt;
			return Math.max(timeUntilReset - elapsedTime, 0);
		},
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});
}
