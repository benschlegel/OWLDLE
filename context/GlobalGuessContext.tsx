'use client';
import type { RowData } from '@/components/game-container/GameContainer';
import { GameStateContext } from '@/context/GameStateContext';
import { type Dataset, DATASETS } from '@/data/datasets';
import { LOCAL_STORAGE_STALE_KEY } from '@/hooks/use-answer-query';
import { LOCAL_STORAGE_STATE_KEY } from '@/hooks/use-game-state';
import type React from 'react';
import {
	createContext,
	type Dispatch,
	type MutableRefObject,
	type PropsWithChildren,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

export const GUESS_LOCAL_STORAGE_KEY = 'guesses';

// Define the type for the dataset's state
interface DatasetState {
	evaluatedGuesses: RowData[];
	setEvaluatedGuesses: Dispatch<SetStateAction<RowData[]>>;
}

// Modify the context value structure to include datasets and isOldRef
interface EvaluatedGuessContextType {
	datasets: Record<Dataset, DatasetState>;
}

// Create a context with an empty initial value
const EvaluatedGuessContext = createContext<EvaluatedGuessContextType | undefined>(undefined);

// The provider will manage the states for different datasets
export function EvaluatedGuessProvider({ children }: PropsWithChildren) {
	// * Load state from localStorage
	const loadInitialData = useCallback(() => {
		if (typeof window !== 'undefined') {
			const storageData = localStorage.getItem(GUESS_LOCAL_STORAGE_KEY);
			if (storageData) {
				// Parsing and creating initial state from localStorage
				const parsedData = JSON.parse(storageData) as Record<Dataset, { evaluatedGuesses: RowData[] }>;

				return DATASETS.reduce(
					(acc, dataset) => {
						acc[dataset] = {
							evaluatedGuesses: parsedData[dataset]?.evaluatedGuesses ?? [],
							setEvaluatedGuesses: () => void 0,
						};
						return acc;
					},
					{} as Record<Dataset, DatasetState>
				);
			}
		}
		// Return default empty state if nothing in localStorage
		return DATASETS.reduce(
			(acc, dataset) => {
				acc[dataset] = {
					evaluatedGuesses: [],
					setEvaluatedGuesses: () => void 0,
				};
				return acc;
			},
			{} as Record<Dataset, DatasetState>
		);
	}, []);

	const [datasets, setDatasets] = useState<Record<Dataset, DatasetState>>(() => {
		const initialData = loadInitialData();

		// Initialize each dataset with an empty items array and setter
		const initialState = {} as Record<Dataset, DatasetState>;

		for (const dataset of DATASETS) {
			initialState[dataset] = {
				evaluatedGuesses: initialData[dataset].evaluatedGuesses,
				setEvaluatedGuesses: (newRowsOrUpdater) => {
					setDatasets((prev) => {
						const updatedEvaluatedGuesses =
							typeof newRowsOrUpdater === 'function'
								? newRowsOrUpdater(prev[dataset].evaluatedGuesses) // Handle functional update
								: newRowsOrUpdater;

						const updatedDatasets = {
							...prev,
							[dataset]: { ...prev[dataset], evaluatedGuesses: updatedEvaluatedGuesses },
						};

						// Update localStorage with the new state
						localStorage.setItem(GUESS_LOCAL_STORAGE_KEY, JSON.stringify(updatedDatasets));

						return updatedDatasets;
					});
				},
			};
		}
		// Return the initialized dataset state (default value of state)
		return initialState;
	});

	return <EvaluatedGuessContext.Provider value={{ datasets }}>{children}</EvaluatedGuessContext.Provider>;
}

// Create a custom hook to use items based on the dataset key
export const useEvaluatedGuesses = (dataset: Dataset, isStale: MutableRefObject<boolean>) => {
	const context = useContext(EvaluatedGuessContext);
	const [_gameState, setGameState] = useContext(GameStateContext);

	if (!context) {
		throw new Error('useEvaluatedGuesses must be used within an EvaluatedGuessProvider');
	}

	const { evaluatedGuesses, setEvaluatedGuesses } = context.datasets[dataset];

	const handleStale = useCallback(() => {
		if (isStale) {
			if (isStale.current === true) {
				isStale.current = false;
				// localStorage.removeItem(LOCAL_STORAGE_STALE_KEY);
				localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);

				// Update localStorage state
				const initialState = {} as Record<Dataset, { evaluatedGuesses: number[] }>;
				for (const dataset of DATASETS) {
					initialState[dataset] = { evaluatedGuesses: [] };
				}
				console.log('Writing: ', initialState);
				try {
					localStorage.setItem(GUESS_LOCAL_STORAGE_KEY, JSON.stringify(initialState));
				} catch (e) {
					console.error('Could not write to localStorage: ', e);
				}
				setEvaluatedGuesses([]);
				setGameState('in-progress');
				console.log('Is old.');
			}
		}
	}, [setEvaluatedGuesses, setGameState, isStale]);

	useEffect(() => {
		handleStale();
	});
	return {
		data: { evaluatedGuesses, setEvaluatedGuesses },
	};
};
