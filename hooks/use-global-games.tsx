import { useQuery } from '@tanstack/react-query';

async function fetchGlobalGames(): Promise<number> {
	const res = await fetch('/api/statistics/global');
	if (!res.ok) throw new Error('Failed to load global games');
	const json = (await res.json()) as { totalGames: number };
	return json.totalGames;
}

/** Live all-time games-played count. Polls the uncached endpoint so the number
 *  stays current without a reload; refetches on window focus too. */
export function useGlobalGames() {
	return useQuery({
		queryKey: ['statistics', 'global-games'],
		queryFn: fetchGlobalGames,
		refetchInterval: 6_000,
		refetchOnWindowFocus: true,
		staleTime: 0,
	});
}
