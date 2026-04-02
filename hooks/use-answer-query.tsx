import type { DatasetAnswer } from '@/app/api/validate/route';
import { GUESS_LOCAL_STORAGE_KEY } from '@/context/GlobalGuessContext';
import type { Dataset } from '@/data/datasets';
import { LOCAL_STORAGE_STATE_KEY } from '@/hooks/use-game-state';
import type { ValidateResponse } from '@/types/server';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };

const LOCAL_STORAGE_ITERATION_KEY = 'latestIteration';
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

// How many times to automatically retry fetching after a reset before giving up
const MAX_RETRIES = 3;
// Interval to send retries
const RETRY_INTERVAL = 5_000;

export function useAnswerQuery(dataset: Dataset) {
	const isStaleRef = useRef(false);
	// tracks retries after reset (to ensure MAX_RETRIES works. resets to 0 with fresh data.)
	const postResetRetryCountRef = useRef(0);
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
		// Poll every 5s when nextReset is already in the past (server hasn't updated yet).
		// Stops after MAX_RETRIES attempts. Counter resets when fresh data arrives.
		refetchInterval: (query) => {
			const raw = query.state.data as FetchResult | undefined;
			const nextReset = raw?.data?.[0]?.answer?.nextReset;
			if (!nextReset) return false;
			// data is fresh, reset for next daily cycle
			if (new Date(nextReset).getTime() > Date.now()) {
				postResetRetryCountRef.current = 0;
				return false;
			}
			if (postResetRetryCountRef.current >= MAX_RETRIES) return false;
			postResetRetryCountRef.current++;
			return RETRY_INTERVAL;
		},
	});

	return { ...query, isStale: isStaleRef };
}
