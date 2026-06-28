import type { HistoryDetailResponse } from '@/types/history';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

async function fetchDetail(dataset: string, iteration: number, stage: string | null): Promise<HistoryDetailResponse> {
	const params = new URLSearchParams({ dataset, iteration: String(iteration) });
	if (stage) params.set('stage', stage);
	const res = await fetch(`/api/history/detail?${params}`);
	if (!res.ok) throw new Error('Failed to load answer detail');
	return res.json();
}

export function useHistoryDetail(dataset: string, iteration: number | null, stage: string | null) {
	return useQuery({
		queryKey: ['history-detail', dataset, stage, iteration],
		queryFn: () => fetchDetail(dataset, iteration as number, stage),
		enabled: iteration != null,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
}
