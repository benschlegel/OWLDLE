import type { HistoryListResponse } from '@/types/history';
import { useQuery } from '@tanstack/react-query';

async function fetchHistory(dataset: string): Promise<HistoryListResponse> {
	const res = await fetch(`/api/history?dataset=${encodeURIComponent(dataset)}`);
	if (!res.ok) throw new Error('Failed to load history');
	return res.json();
}

/** Loads the entire history (all stages, all iterations) for a dataset at once. */
export function useHistory(dataset: string) {
	return useQuery({
		queryKey: ['history', dataset],
		queryFn: () => fetchHistory(dataset),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
