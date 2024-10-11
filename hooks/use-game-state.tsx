import type { RowData } from '@/components/game-container/GameContainer';
import { DatasetContext } from '@/context/DatasetContext';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { type Dataset, DATASETS, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { validateGuess } from '@/lib/server';
import type { DbSaveData } from '@/types/database';
import type { PlausibleEvents } from '@/types/plausible';
import type { GuessResponse } from '@/types/server';
import { usePlausible } from 'next-plausible';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAnswerQuery } from '@/hooks/use-answer-query';
import type { GameState } from '@/types/client';
import { useEvaluatedGuesses } from '@/context/GlobalGuessContext';

type Props = {
	slug: string;
};

export const LOCAL_STORAGE_STATE_KEY = 'gameState';

export default function useGameState({ slug }: Props) {
	const [playerGuesses, setPlayerGuesses] = useContext(GuessContext);
	const [gameState, setGameState] = useContext(GameStateContext);
	const [_, setDataset] = useContext(DatasetContext);
	const isRollbackRef = useRef(false);
	const plausible = usePlausible<PlausibleEvents>();

	const dataset = useMemo(() => getDataset(slug as Dataset) ?? DEFAULT_DATASET, [slug]);
	const { data: validatedData } = useAnswerQuery(dataset.dataset);
	const { data, isOld } = useEvaluatedGuesses(dataset.dataset);
	const { evaluatedGuesses, setEvaluatedGuesses } = data;

	// Update dataset and reset guesses when slug cahnges (slug change updates dataset)
	useEffect(() => {
		setDataset(dataset);
		resetGuesses();
	}, [dataset, setDataset]);

	const resetGuesses = useCallback(() => {
		// * If evaluated guesses exist (read from localStorage), use them + update gameState
		if (evaluatedGuesses.length > 0) {
			if (typeof window !== 'undefined') {
				const gameStateOld = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
				if (gameStateOld) {
					const parsedOldState = JSON.parse(gameStateOld) as SavedState;
					setGameState(parsedOldState[dataset.dataset]);
				} else {
					const defaultValues = getDefaultGameState();
					localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(defaultValues));
					setGameState('in-progress');
				}
			}
			isRollbackRef.current = true;
		} else {
			// * Regular reset
			setGameState('in-progress');
			isRollbackRef.current = true;
			setPlayerGuesses([]);
			setEvaluatedGuesses([]);
		}
	}, [setPlayerGuesses, setGameState, setEvaluatedGuesses, evaluatedGuesses, dataset.dataset]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		if (isRollbackRef.current === true) {
			isRollbackRef.current = false;
		} else if (playerGuesses && playerGuesses.length > 0 && playerGuesses.length <= GAME_CONFIG.maxGuesses) {
			handleGuess();
		}
	}, [playerGuesses]);

	const saveGame = useCallback(
		(data: DbSaveData) => {
			fetch(`/api/save?dataset=${dataset.dataset}`, { method: 'POST', body: JSON.stringify(data) })
				.then((r) => {
					if (r.status === 200) {
						plausible('finishGame', { props: { didSucceed: true, state: data.gameResult, dataset: dataset.dataset } });
						console.log('saved successfully!');
					}
				})
				.catch((e) => plausible('finishGame', { props: { didSucceed: false, state: data.gameResult, dataset: dataset.dataset } }));
		},
		[plausible, dataset.dataset]
	);

	const handleGuess = useCallback(async () => {
		// Get current guess
		const currentGuess: CombinedFormattedPlayer = playerGuesses[playerGuesses.length - 1];

		// Double-check that conditions are valid (should always be the case already)
		if (validatedData !== undefined && gameState === 'in-progress' && isRollbackRef.current === false) {
			console.log(`Applying...`, currentGuess);
			// Validate data
			const correctPlayer = validatedData.correctPlayer;
			const guessResult: GuessResponse = validateGuess(currentGuess, correctPlayer);

			// Add guess response to row
			const newRow: RowData = { guessResult: guessResult, player: currentGuess };
			setEvaluatedGuesses((prevEvaluatedGuesses) => [...prevEvaluatedGuesses, newRow]);
			const newData = [...evaluatedGuesses, newRow];
			console.log('Curr guesses: ', newData.length);

			// TODO: refactor game over logic in callback and use while reading old one
			// Determine game state
			let result: GameState = 'in-progress';
			if (guessResult.isNameCorrect === true) {
				result = 'won';
			} else if (newData.length === GAME_CONFIG.maxGuesses) {
				result = 'lost';
			}

			// Save current state to localStorage
			saveLocalStorageState(dataset.dataset, result);

			// Save result and update game state
			if (result !== 'in-progress') {
				setGameState(result);
				const data: DbSaveData = { gameData: [...evaluatedGuesses, newRow], gameResult: result };
				saveGame(data);
			}
		} else {
			// Guess could not be processed, remove last guess
			isRollbackRef.current = true;
			setPlayerGuesses((old) => old.slice(0, -1));
		}
	}, [gameState, validatedData, playerGuesses, setGameState, evaluatedGuesses, setPlayerGuesses, saveGame, setEvaluatedGuesses, dataset.dataset]);

	return [evaluatedGuesses, gameState, validatedData, isOld] as const;
}

type SavedState = { [key: string]: GameState };
function getDefaultGameState() {
	const mappedState: SavedState = {};
	for (const dataset of DATASETS) {
		mappedState[dataset] = 'in-progress';
	}
	return mappedState;
}

function saveLocalStorageState(dataset: Dataset, state: GameState) {
	if (typeof window !== 'undefined') {
		const old = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
		if (old) {
			// Update old state if it exists.
			const parsed = JSON.parse(old);
			parsed[dataset] = state;
			localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(parsed));
		} else {
			// If entry doesn't exist yet, add it
			const defaultValues = getDefaultGameState();
			localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(defaultValues));
		}
	}
}
