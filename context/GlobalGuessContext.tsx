'use client';
import type { RowData } from '@/components/game-container/GameContainer';
import { type Dataset, DATASETS } from '@/data/datasets';
import type React from 'react';
import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useCallback, useContext, useRef, useState } from 'react';

const GUESS_LOCAL_STORAGE_KEY = 'guesses';

// Define the type for the dataset's state
interface DatasetState {
	evaluatedGuesses: RowData[];
	setEvaluatedGuesses: Dispatch<SetStateAction<RowData[]>>;
}

// Modify the context value structure to include datasets and isOldRef
interface EvaluatedGuessContextType {
	datasets: Record<Dataset, DatasetState>;
	isOldRef: boolean;
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

	return <EvaluatedGuessContext.Provider value={{ datasets, isOldRef: isOldRef.current }}>{children}</EvaluatedGuessContext.Provider>;
}

// Create a custom hook to use items based on the dataset key
export const useEvaluatedGuesses = (dataset: Dataset) => {
	const context = useContext(EvaluatedGuessContext);

	if (!context) {
		throw new Error('useEvaluatedGuesses must be used within an EvaluatedGuessProvider');
	}

	return {
		data: context.datasets[dataset],
		isOld: context.isOldRef,
	};
};
