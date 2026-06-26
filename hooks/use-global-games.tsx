import { useQuery } from '@tanstack/react-query';

async function fetchGlobalGames(prod: boolean): Promise<number> {
	const res = await fetch(`/api/statistics/global${prod ? '?prod=1' : ''}`);
	if (!res.ok) throw new Error('Failed to load global games');
	const json = (await res.json()) as { totalGames: number };
	return json.totalGames;
}

/** Live all-time games-played count. Polls the uncached endpoint so the number
 *  stays current without a reload; refetches on window focus too. */
export function useGlobalGames(prod = false) {
	return useQuery({
		queryKey: ['statistics', 'global-games', prod],
		queryFn: () => fetchGlobalGames(prod),
		refetchInterval: 6_000,
		refetchOnWindowFocus: true,
		staleTime: 0,
	});
}
