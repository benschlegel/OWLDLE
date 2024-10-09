import type { DatasetAnswer } from '@/app/api/validate/route';
import type { Dataset } from '@/data/datasets';
import type { ValidateResponse } from '@/types/server';
import { useQuery } from '@tanstack/react-query';

type DatasetValidatedResponse = { dataset: Dataset; answer: Required<ValidateResponse> };

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
	return formatted;
}

export function useAnswerQuery(dataset: Dataset) {
	return useQuery({
		queryKey: ['all'],
		queryFn: () => fetchValidateDataset(),
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
