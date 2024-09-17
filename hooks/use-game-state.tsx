import type { RowData } from '@/components/game-container/GameContainer';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { toast, useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse, ValidateResponse } from '@/types/server';
import { useContext, useEffect, useState } from 'react';

export default function useGameState() {
	const [playerGuesses, _] = useContext(GuessContext);
	const [gameState, setGameState] = useContext(GameStateContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);
	const [currentGuess, setCurrentGuess] = useState<FormattedPlayer | undefined>(undefined);
	const [validatedData, setValidatedData] = useState<ValidateResponse>();
	const { toast } = useToast();

	useEffect(() => {
		fetch('/api/validate')
			.then((response) => response.json())
			.catch(() => {
				toast({
					title: "Can't reach server",
					description: "Couldn't reach server",
				});
			})
			.then((data) => setValidatedData(data));
	}, [toast]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		// Ensure that the max guesses are respected
		if (playerGuesses.length <= GAME_CONFIG.maxGuesses) {
			const latestGuess: FormattedPlayer = playerGuesses[playerGuesses.length - 1];
			setCurrentGuess(latestGuess);
		}

		// Clean up state if guesses are reset
		// if (playerGuesses.length === 0) {
		// 	resetGameState();
		// }
	}, [playerGuesses]);

	// Handle new guess
	useEffect(() => {
		if (currentGuess !== undefined && gameState === 'in-progress') {
			console.time('validate');
			fetch('/api/validate', {
				method: 'POST',
				body: JSON.stringify(currentGuess),
			})
				.then(async (res) => {
					// Get response from server
					const guessResponse: GuessResponse = await res.json();
					console.timeEnd('validate');

					// Add guess response to row
					const newRow: RowData = { guessResult: guessResponse, player: currentGuess };
					setEvaluatedGuesses((prevEvaluatedGuesses) => [...prevEvaluatedGuesses, newRow]);

					// update game state
					if (guessResponse.isNameCorrect === true) {
						setGameState('won');
						// TODO: send anonymous game report
					} else if (playerGuesses.length === GAME_CONFIG.maxGuesses) {
						setGameState('lost');
					}

					// Reset player
					setCurrentGuess(undefined);
				})
				.catch(() => {
					toast({
						title: 'Server error',
						description: "Can't reach server or invalid data.",
						variant: 'destructive',
					});

					// Reset player
					setCurrentGuess(undefined);
				});
		}
	}, [currentGuess, setGameState, toast, gameState, playerGuesses.length]);
	return [evaluatedGuesses, gameState, validatedData] as const;
}
