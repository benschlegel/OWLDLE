import type { DatasetAnswer } from '@/app/api/validate/route';
import { GUESS_LOCAL_STORAGE_KEY } from '@/context/GlobalGuessContext';
import type { Dataset } from '@/data/datasets';
import { LOCAL_STORAGE_STATE_KEY } from '@/hooks/use-game-state';
import type { ValidateResponse } from '@/types/server';
import { type QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };
export const LOCAL_STORAGE_STALE_KEY = 'isStale';

async function fetchValidateDataset(queryClient: QueryClient) {
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

	// Extract first answer data to check cache invalidation timing
	const { nextReset } = formatted[0].answer;

	// Calculate time until the next reset
	const currentTime = new Date().getTime();
	const resetTime = new Date(nextReset).getTime();
	const timeUntilReset = resetTime - currentTime;

	// * Invalidate query if data is outdated (nextReset time has passed)
	if (timeUntilReset <= 0) {
		if (typeof window !== 'undefined') {
			console.log('Query data outdated.');
			localStorage.setItem(LOCAL_STORAGE_STALE_KEY, 'true');
		}
		queryClient.invalidateQueries({ queryKey: ['all'], exact: true });
	} else {
		// Update query cache data and dynamically set staleTime based on nextReset
		console.log(`Cache will persist for ${timeUntilReset / 1000} seconds.`);
		queryClient.setQueryData(['all'], formatted);
		queryClient.setQueryDefaults(['all'], {
			staleTime: timeUntilReset, // Dynamic stale time until next reset
		});
	}

	return formatted;
}

export function useAnswerQuery(dataset: Dataset) {
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: ['all'],
		queryFn: () => fetchValidateDataset(queryClient),
		select: (data: DatasetValidatedResponse[]) => {
			// Find and return the specific dataset from the array
			const found = data.find((item) => item.dataset === dataset)?.answer ?? data[0].answer;
			return found;
		},
		staleTime: 6 * 60 * 60 * 1000, // Stays in cache for 6 hours
		refetchOnWindowFocus: false, // Disable fetching on window focus, data doesn't update that often
	});
}

// (query) => {
//   const data = query.state.data;
//   if (data) {
//     const responseDate = new Date(data.nextReset);
//     const now = new Date();
//     const diffInHours = (now.getTime() - responseDate.getTime()) / (1000 * 60 * 60);
//     return diffInHours >= 1 ? 0 : undefined; // Refetch if more than 1 hour has passed
//   }
//   return undefined;
// },
// });
