import type { Dataset } from '@/data/datasets';
import type { DbGameStats } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type GameStatsData = Omit<DbGameStats, '_id'>;

export const STATS_QUERY_KEY = 'game-stats';

async function fetchStats(dataset: Dataset): Promise<GameStatsData | null> {
	const response = await fetch(`/api/stats?dataset=${dataset}`);
	if (!response.ok) return null;
	const json = await response.json();
	return json.stats ?? null;
}

export function useGameStats(dataset: Dataset) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: [STATS_QUERY_KEY, dataset],
		queryFn: () => fetchStats(dataset),
		enabled: false,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	/** Inject stats directly into query cache (used after POST /api/save returns stats) */
	const setStats = (stats: GameStatsData) => {
		queryClient.setQueryData([STATS_QUERY_KEY, dataset], stats);
	};

	return { ...query, setStats };
}
