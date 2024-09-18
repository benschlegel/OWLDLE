import type { RowData } from '@/components/game-container/GameContainer';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import { validateGuess } from '@/lib/server';
import type { GuessResponse, ValidateResponse } from '@/types/server';
import { useCallback, useContext, useEffect, useState } from 'react';

export default function useGameState() {
	const [playerGuesses, _] = useContext(GuessContext);
	const [gameState, setGameState] = useContext(GameStateContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);
	const [validatedData, setValidatedData] = useState<ValidateResponse>();
	const { toast } = useToast();

	useEffect(() => {
		fetch('/api/validate')
			.then((response) => response.json())
			.catch(() => {
				toast({
					title: 'Server error',
					description: "Can't reach server or invalid data.",
					variant: 'destructive',
				});
			})
			.then((data) => setValidatedData(data));
	}, [toast]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		// Ensure that the max guesses are respected
		if (playerGuesses && playerGuesses.length > 0 && playerGuesses.length <= GAME_CONFIG.maxGuesses) {
			handleGuess();
		}

		// Clean up state if guesses are reset
		// if (playerGuesses.length === 0) {
		// 	resetGameState();
		// }
	}, [playerGuesses]);

	const handleGuess = useCallback(() => {
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
			console.log('Guesses: ', newGuesses);
			setEvaluatedGuesses(newGuesses);

			// update game state
			if (guessResult.isNameCorrect === true) {
				setGameState('won');
			} else if (playerGuesses.length === GAME_CONFIG.maxGuesses) {
				setGameState('lost');
			}
		} else {
			toast({
				title: 'Please try again',
				description: 'Something went wrong, please try again',
			});
		}
	}, [toast, gameState, validatedData, playerGuesses, setGameState, evaluatedGuesses]);

	return [evaluatedGuesses, gameState, validatedData] as const;
}
