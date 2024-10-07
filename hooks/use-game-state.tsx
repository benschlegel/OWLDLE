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
import { useCallback, useContext, useEffect, useState } from 'react';
import { useAnswerQuery } from '@/hooks/use-answer-query';

type Props = {
	slug: string;
};

export default function useGameState({ slug }: Props) {
	const [playerGuesses, setPlayerGuesses] = useContext(GuessContext);
	const [gameState, setGameState] = useContext(GameStateContext);
	const [dataset, setDataset] = useContext(DatasetContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);
	const { data: validatedData } = useAnswerQuery(dataset.dataset);
	const [isRollback, setIsRollback] = useState(false);
	const plausible = usePlausible<PlausibleEvents>();

	// * Set global dataset if slug changes
	useEffect(() => {
		const newDataset = getDataset(slug as Dataset) ?? DEFAULT_DATASET;
		setDataset(newDataset);
	}, [slug, setDataset]);

	// * Fetch correct guess + data from server
	// biome-ignore lint/correctness/useExhaustiveDependencies: Should reset all guesses every time dataset changes
	useEffect(() => {
		// Reset all guesses (in case dataset was changed)
		resetGuesses();
	}, [dataset]);

	const resetGuesses = useCallback(() => {
		setGameState('in-progress');
		setIsRollback(true);
		setPlayerGuesses([]);
		setEvaluatedGuesses([]);
	}, [setPlayerGuesses, setGameState]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		// Skip handling guess if playerGuesses changed due to rollback
		if (isRollback === true) {
			setIsRollback(false);
			return;
		}

		// Ensure that the max guesses are respected
		if (playerGuesses && playerGuesses.length > 0 && playerGuesses.length <= GAME_CONFIG.maxGuesses) {
			handleGuess();
		}
	}, [playerGuesses, isRollback]);

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

			// * Game is won
			if (guessResult.isNameCorrect === true) {
				setGameState('won');
				const data: DbSaveData = { gameData: newGuesses, gameResult: 'won' };
				saveGame(data);
			} else if (playerGuesses.length === GAME_CONFIG.maxGuesses) {
				// * Game is lost
				setGameState('lost');
				const data: DbSaveData = { gameData: newGuesses, gameResult: 'lost' };
				saveGame(data);
			}
		} else {
			// Guess could not be processed, remove last guess
			setIsRollback(true);
			setPlayerGuesses((old) => old.slice(0, -1));
			// toast({
			// 	title: 'Please try again',
			// 	description: 'Something went wrong, please try again',
			// });
		}
	}, [gameState, validatedData, playerGuesses, setGameState, evaluatedGuesses, setPlayerGuesses, saveGame]);

	return [evaluatedGuesses, gameState, validatedData] as const;
}
