import type { HistoryDetailResponse } from '@/types/history';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

async function fetchDetail(dataset: string, iteration: number): Promise<HistoryDetailResponse> {
	const res = await fetch(`/api/history/detail?dataset=${encodeURIComponent(dataset)}&iteration=${iteration}`);
	if (!res.ok) throw new Error('Failed to load answer detail');
	return res.json();
}

export function useHistoryDetail(dataset: string, iteration: number | null) {
	return useQuery({
		queryKey: ['history-detail', dataset, iteration],
		queryFn: () => fetchDetail(dataset, iteration as number),
		enabled: iteration != null,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
}
