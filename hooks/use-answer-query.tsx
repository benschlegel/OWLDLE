import type { Dataset } from '@/data/datasets';
import type { ValidateResponse } from '@/types/server';
import { useQuery } from '@tanstack/react-query';

async function fetchValidateDataset(dataset: Dataset): Promise<ValidateResponse> {
	const response = await fetch(`/api/validate?${dataset}`);
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	return response.json();
}

export function useAnswerQuery(dataset: Dataset) {
	return useQuery({
		queryKey: ['dataset', dataset],
		queryFn: () => fetchValidateDataset(dataset),
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 60 * 60 * 1000,
		refetchInterval: 60 * 60 * 1000,
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
