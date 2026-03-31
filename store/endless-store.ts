import type { GuessResponse } from '@/types/server';
import type { Dataset } from '@/data/datasets';
import { markGameCompleted } from '@/components/pwa-provider';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GameState = 'in-progress' | 'won' | 'lost';

/** compact guess in localStorage, only player ID + result booleans */
export type CompactGuess = {
	id: number;
	result: GuessResponse;
};

export type EndlessGame = {
	// index of player in given dataset
	playerIndex: number;
	guesses: CompactGuess[];
	state: GameState;
};

export type SessionGameEntry = {
	guessCount: number;
	result: 'won' | 'lost';
};

export type EndlessFilters = {
	/** Active regions. Empty array means all regions are included. */
	regions: string[];
	partnerOnly: boolean;
};

const defaultFilters: EndlessFilters = { regions: [], partnerOnly: false };

export type DatasetStats = {
	currentStreak: number;
	highestStreak: number;
	wins: number;
	games: number;
	current: EndlessGame | null;
	/** per-game summary for the current streak, persisted so partial streaks survive page reloads */
	sessionHistory: SessionGameEntry[];
	filters: EndlessFilters;
};

const defaultStats: DatasetStats = {
	currentStreak: 0,
	highestStreak: 0,
	wins: 0,
	games: 0,
	current: null,
	sessionHistory: [],
	filters: defaultFilters,
};

type EndlessStore = {
	datasets: Partial<Record<Dataset, DatasetStats>>;
	getStats: (dataset: Dataset) => DatasetStats;
	startGame: (dataset: Dataset, validIndices: number[]) => void;
	addGuess: (dataset: Dataset, guess: CompactGuess) => void;
	winGame: (dataset: Dataset) => void;
	loseGame: (dataset: Dataset) => void;
	updateFilters: (dataset: Dataset, filters: EndlessFilters) => void;
	playAgain: (dataset: Dataset, validIndices: number[]) => void;
};

function randomIndex(max: number): number {
	return Math.floor(Math.random() * max);
}

export const ENDLESS_STORE_KEY = 'endless';

export const useEndlessStore = create<EndlessStore>()(
	persist(
		(set, get) => ({
			datasets: {},
			getStats: (dataset) => get().datasets[dataset] ?? defaultStats,
			startGame: (dataset, validIndices) =>
				set((state) => {
					const prev = state.datasets[dataset] ?? defaultStats;
					if (prev.current?.state === 'in-progress') return state;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								...prev,
								current: { playerIndex: validIndices[randomIndex(validIndices.length)], guesses: [], state: 'in-progress' },
							},
						},
					};
				}),
			addGuess: (dataset, guess) =>
				set((state) => {
					const prev = state.datasets[dataset];
					if (!prev?.current || prev.current.state !== 'in-progress') return state;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								...prev,
								current: {
									...prev.current,
									guesses: [...prev.current.guesses, guess],
								},
							},
						},
					};
				}),
			winGame: (dataset) => {
				set((state) => {
					const prev = state.datasets[dataset];
					if (!prev?.current) return state;
					const newStreak = prev.currentStreak + 1;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								...prev,
								currentStreak: newStreak,
								highestStreak: Math.max(prev.highestStreak, newStreak),
								wins: prev.wins + 1,
								games: prev.games + 1,
								sessionHistory: [...(prev.sessionHistory ?? []), { guessCount: prev.current.guesses.length, result: 'won' }],
								current: { ...prev.current, state: 'won' },
							},
						},
					};
				});
				markGameCompleted();
			},
			loseGame: (dataset) => {
				set((state) => {
					const prev = state.datasets[dataset];
					if (!prev?.current) return state;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								...prev,
								currentStreak: 0,
								games: prev.games + 1,
								sessionHistory: [...(prev.sessionHistory ?? []), { guessCount: prev.current.guesses.length, result: 'lost' }],
								current: { ...prev.current, state: 'lost' },
							},
						},
					};
				});
				markGameCompleted();
			},
			updateFilters: (dataset, filters) =>
				set((state) => {
					const prev = state.datasets[dataset] ?? defaultStats;
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								...prev,
								filters,
								currentStreak: 0,
								sessionHistory: [],
								current: null,
							},
						},
					};
				}),
			playAgain: (dataset, validIndices) =>
				set((state) => {
					const prev = state.datasets[dataset] ?? defaultStats;
					// clear sessionHistory only after a loss (streak ended), preserve it midstreak after a win
					const wasLost = prev.current?.state === 'lost';
					return {
						datasets: {
							...state.datasets,
							[dataset]: {
								...prev,
								sessionHistory: wasLost ? [] : prev.sessionHistory ?? [],
								current: { playerIndex: validIndices[randomIndex(validIndices.length)], guesses: [], state: 'in-progress' },
							},
						},
					};
				}),
		}),
		{ name: ENDLESS_STORE_KEY }
	)
);
