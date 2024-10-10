'use client';
import type { RowData } from '@/components/game-container/GameContainer';
import { type Dataset, DATASETS } from '@/data/datasets';
import type React from 'react';
import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useCallback, useContext, useRef, useState } from 'react';

const GUESS_LOCAL_STORAGE_KEY = 'guesses';
const ITERATION_LOCAL_STORAGE_KEY = 'lastPlayedIteration';

// Define the type for the dataset's state
interface DatasetState {
	evaluatedGuesses: RowData[];
	setEvaluatedGuesses: Dispatch<SetStateAction<RowData[]>>;
}

// Modify the context value structure to include datasets and isOldRef
interface EvaluatedGuessContextType {
	datasets: Record<Dataset, DatasetState>;
	isOldRef: React.MutableRefObject<boolean>;
}

// Create a context with an empty initial value
const EvaluatedGuessContext = createContext<EvaluatedGuessContextType | undefined>(undefined);

// The provider will manage the states for different datasets
export function EvaluatedGuessProvider({ children }: PropsWithChildren) {
	const isOldRef = useRef(false);

	// * Load state from localStorage
	const loadInitialData = useCallback(() => {
		if (typeof window !== 'undefined') {
			const storageData = localStorage.getItem(GUESS_LOCAL_STORAGE_KEY);
			if (storageData) {
				// Data was loaded from localStorage
				isOldRef.current = true;

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

	return <EvaluatedGuessContext.Provider value={{ datasets, isOldRef }}>{children}</EvaluatedGuessContext.Provider>;
}

// Create a custom hook to use items based on the dataset key
export const useEvaluatedGuesses = (dataset: Dataset, currIteration = -1) => {
	const context = useContext(EvaluatedGuessContext);

	if (!context) {
		throw new Error('useEvaluatedGuesses must be used within an EvaluatedGuessProvider');
	}

	const { evaluatedGuesses, setEvaluatedGuesses } = context.datasets[dataset];

	const isOldRef = context.isOldRef;
	if (typeof window !== 'undefined' && currIteration !== -1) {
		const storedIteration = localStorage.getItem(ITERATION_LOCAL_STORAGE_KEY);
		if (storedIteration) {
			const lastIteration = Number.parseInt(storedIteration);
			if (currIteration > lastIteration) {
				// reset guesses if stale (newer iteration available, evaluatedGuesses get reset in use-game-state automatically since empty/isOld = false)
				setEvaluatedGuesses([]);
				isOldRef.current = false;
				console.log('Is old.');
			}
		}
		// Save new iteration to localStorage (if it doesn't exist or is outdated)
		localStorage.setItem(ITERATION_LOCAL_STORAGE_KEY, currIteration.toString());
	}
	return {
		data: { evaluatedGuesses, setEvaluatedGuesses },
		isOld: isOldRef,
	};
};
