import type { Dataset } from '@/data/datasets';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Per-dataset player stats persisted to localStorage.
 * Stored once per dataset (lifetime stats, not per-iteration).
 * Distribution array: index 0 = failed, index N = won in N guesses.
 */
export type PlayerStats = {
	games: number;
	wins: number;
	currentStreak: number;
	highestStreak: number;
	distribution: number[];
};

export const emptyStats: PlayerStats = { games: 0, wins: 0, currentStreak: 0, highestStreak: 0, distribution: [] };

type PlayerStatsStore = {
	datasets: Partial<Record<Dataset, PlayerStats>>;
	getStats: (dataset: Dataset) => PlayerStats;
	recordWin: (dataset: Dataset, guessCount: number) => void;
	recordLoss: (dataset: Dataset) => void;
};

export const PLAYER_STATS_KEY = 'player-stats';

export const usePlayerStatsStore = create<PlayerStatsStore>()(
	persist(
		(set, get) => ({
			datasets: {},

			getStats: (dataset) => get().datasets[dataset] ?? emptyStats,

			recordWin: (dataset, guessCount) =>
				set((state) => {
					const prev = state.datasets[dataset] ?? { ...emptyStats, distribution: [] };
					const newStreak = prev.currentStreak + 1;
					const dist = [...prev.distribution];
					while (dist.length <= guessCount) dist.push(0);
					dist[guessCount]++;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								games: prev.games + 1,
								wins: prev.wins + 1,
								currentStreak: newStreak,
								highestStreak: Math.max(prev.highestStreak, newStreak),
								distribution: dist,
							},
						},
					};
				}),

			recordLoss: (dataset) =>
				set((state) => {
					const prev = state.datasets[dataset] ?? { ...emptyStats, distribution: [] };
					const dist = [...prev.distribution];
					while (dist.length < 1) dist.push(0);
					dist[0]++;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								games: prev.games + 1,
								wins: prev.wins,
								currentStreak: 0,
								highestStreak: prev.highestStreak,
								distribution: dist,
							},
						},
					};
				}),
		}),
		{
			name: PLAYER_STATS_KEY,
			storage: createJSONStorage(() => {
				if (typeof window !== 'undefined') return localStorage;
				// Return no-op storage for non-browser environments (tests)
				return {
					getItem: () => null,
					setItem: () => {},
					removeItem: () => {},
				};
			}),
		}
	)
);

/** Readable helpers derived from player stats */
export function readablePlayerStats(stats: PlayerStats) {
	const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
	const totalWinGuesses = stats.distribution.reduce((sum, count, i) => (i > 0 ? sum + count * i : sum), 0);
	const avgGuesses = stats.wins > 0 ? +(totalWinGuesses / stats.wins).toFixed(1) : 0;
	return {
		gamesPlayed: stats.games,
		wins: stats.wins,
		winRate,
		currentStreak: stats.currentStreak,
		highestStreak: stats.highestStreak,
		avgGuesses,
		guessDistribution: stats.distribution,
	};
}
