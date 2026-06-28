import type { HistoryListResponse } from '@/types/history';
import { useInfiniteQuery } from '@tanstack/react-query';

async function fetchHistory(dataset: string, cursor?: number): Promise<HistoryListResponse> {
	const params = new URLSearchParams({ dataset });
	if (cursor !== undefined) params.set('cursor', String(cursor));
	const res = await fetch(`/api/history?${params}`);
	if (!res.ok) throw new Error('Failed to load history');
	return res.json();
}

export function useHistory(dataset: string) {
	return useInfiniteQuery({
		queryKey: ['history', dataset],
		queryFn: ({ pageParam }) => fetchHistory(dataset, pageParam),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
