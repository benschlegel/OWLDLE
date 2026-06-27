import type { OverviewResponse } from '@/types/statistics';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

async function fetchOverview(): Promise<OverviewResponse> {
	const res = await fetch('/api/statistics/overview');
	if (!res.ok) throw new Error('Failed to load overview statistics');
	return res.json();
}

/** All-time, all-dataset overview for "Global Metrics" section. */
export function useOverview() {
	return useQuery({
		queryKey: ['overview'],
		queryFn: () => fetchOverview(),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
}
