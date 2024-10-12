import type { DatasetAnswer } from '@/app/api/validate/route';
import type { Dataset } from '@/data/datasets';
import type { ValidateResponse } from '@/types/server';
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };

const ITERATION_KEY = 'latestIteration';
export const LOCAL_STORAGE_STALE_KEY = 'isStale';
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

interface FetchResult {
	data: DatasetValidatedResponse[];
	nextResetTime: number;
	fetchedAt: number;
}

async function fetchValidateDataset(queryClient: QueryClient): Promise<FetchResult> {
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

	const currentTime = new Date().getTime();
	const nextResetTime = formatted[0].answer.nextReset ? new Date(formatted[0].answer.nextReset).getTime() : currentTime + DEFAULT_STALE_TIME;

	// Update highest iteration
	const highestIteration = Math.max(...formatted.map((item) => item.answer.iteration));
	localStorage.setItem(ITERATION_KEY, highestIteration.toString());

	return { data: formatted, nextResetTime, fetchedAt: currentTime };
}

export function useAnswerQuery(dataset: Dataset) {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: ['all'],
		queryFn: () => fetchValidateDataset(queryClient),
		select: (result: FetchResult) => {
			const found = result.data.find((item) => item.dataset === dataset)?.answer ?? result.data[0].answer;
			const currentTime = new Date().getTime();
			const timeUntilReset = Math.max(result.nextResetTime - currentTime, 0);

			const isStale = currentTime >= result.nextResetTime;

			if (isStale) {
				localStorage.setItem(LOCAL_STORAGE_STALE_KEY, 'true');
			} else {
				localStorage.removeItem(LOCAL_STORAGE_STALE_KEY);
			}

			return {
				...found,
				fetchedAt: result.fetchedAt,
				nextResetTime: result.nextResetTime,
				timeUntilReset,
				isStale,
			};
		},
		staleTime: (oldData) => {
			if (!oldData?.state?.data) return DEFAULT_STALE_TIME;
			const nextResetTime = oldData.state.data.nextResetTime;
			const currentTime = new Date().getTime();
			return Math.max(nextResetTime - currentTime, 0);
		},
		refetchInterval: (data) => {
			if (!data) return DEFAULT_STALE_TIME;
			const currentTime = new Date().getTime();
			return Math.max(data.state.data?.nextResetTime ?? DEFAULT_STALE_TIME - currentTime, 0);
		},
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});
}
