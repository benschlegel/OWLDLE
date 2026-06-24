import type { StatisticsResponse, TimeframeRange } from '@/types/statistics';
import { useQuery } from '@tanstack/react-query';

type Params = { dataset: string; range: TimeframeRange; from: string | null; to: string | null };

async function fetchStatistics({ dataset, range, from, to }: Params): Promise<StatisticsResponse> {
	const sp = new URLSearchParams({ dataset, range });
	if (range === 'custom' && from && to) {
		sp.set('from', from);
		sp.set('to', to);
	}
	const res = await fetch(`/api/statistics?${sp.toString()}`);
	if (!res.ok) throw new Error('Failed to load statistics');
	return res.json();
}

export function useStatistics(params: Params) {
	return useQuery({
		queryKey: ['statistics', params.dataset, params.range, params.from, params.to],
		queryFn: () => fetchStatistics(params),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
