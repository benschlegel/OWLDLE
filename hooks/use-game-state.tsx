import type { RowData } from '@/components/game-container/GameContainer';
import { DatasetContext } from '@/context/DatasetContext';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { type Dataset, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { validateGuess } from '@/lib/server';
import type { DbSaveData } from '@/types/database';
import type { PlausibleEvents } from '@/types/plausible';
import type { GuessResponse } from '@/types/server';
import { usePlausible } from 'next-plausible';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAnswerQuery } from '@/hooks/use-answer-query';
import type { GameState } from '@/types/client';

type Props = {
	slug: string;
};

export default function useGameState({ slug }: Props) {
	const [playerGuesses, setPlayerGuesses] = useContext(GuessContext);
	const [gameState, setGameState] = useContext(GameStateContext);
	const [_, setDataset] = useContext(DatasetContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);
	const isRollbackRef = useRef(false);
	const plausible = usePlausible<PlausibleEvents>();

	const dataset = useMemo(() => getDataset(slug as Dataset) ?? DEFAULT_DATASET, [slug]);
	const { data: validatedData } = useAnswerQuery(dataset.dataset);

	// Update dataset and reset guesses when slug cahnges (slug change updates dataset)
	useEffect(() => {
		setDataset(dataset);
		resetGuesses();
	}, [dataset, setDataset]);

	const resetGuesses = useCallback(() => {
		setGameState('in-progress');
		isRollbackRef.current = true;
		setPlayerGuesses([]);
		setEvaluatedGuesses([]);
	}, [setPlayerGuesses, setGameState]);

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
		const currentGuess: FormattedPlayer = playerGuesses[playerGuesses.length - 1];

		// Double-check that conditions are valid (should always be the case already)
		if (validatedData !== undefined && gameState === 'in-progress') {
			// Validate data
			const correctPlayer = validatedData.correctPlayer;
			const guessResult: GuessResponse = validateGuess(currentGuess, correctPlayer);

			// Add guess response to row
			const newRow: RowData = { guessResult: guessResult, player: currentGuess };
			const newGuesses = [...evaluatedGuesses, newRow];
			setEvaluatedGuesses(newGuesses);

			// Determine game state
			let result: GameState = 'in-progress';
			if (guessResult.isNameCorrect === true) {
				result = 'won';
			} else if (playerGuesses.length === GAME_CONFIG.maxGuesses) {
				result = 'lost';
			}

			// Save result and update game state
			if (result !== 'in-progress') {
				setGameState(result);
				const data: DbSaveData = { gameData: newGuesses, gameResult: result };
				saveGame(data);
			}
		} else {
			// Guess could not be processed, remove last guess
			isRollbackRef.current = true;
			setPlayerGuesses((old) => old.slice(0, -1));
		}
	}, [gameState, validatedData, playerGuesses, setGameState, evaluatedGuesses, setPlayerGuesses, saveGame]);

	return [evaluatedGuesses, gameState, validatedData] as const;
}
