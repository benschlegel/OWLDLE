'use client';
import GameContainer, { type RowData } from '@/components/game-container/GameContainer';
import GameResult from '@/components/game-container/GameResult';
import PlayerSearch from '@/components/game-container/search';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';
import { useCallback, useContext, useEffect, useState } from 'react';

export default function Game() {
	const [playerGuesses, _] = useContext(GuessContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);
	const [gameState, setGameState] = useContext(GameStateContext);
	const [currentGuess, setCurrentGuess] = useState<FormattedPlayer | undefined>(undefined);
	const { toast } = useToast();

	useEffect(() => {
		console.log('State: ', gameState);
	}, [gameState]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		// Ensure that the max guesses are respected
		if (playerGuesses.length <= GAME_CONFIG.maxGuesses) {
			const latestGuess: FormattedPlayer = playerGuesses[playerGuesses.length - 1];
			setCurrentGuess(latestGuess);
		}
	}, [playerGuesses]);

	// Handle new guess
	useEffect(() => {
		if (currentGuess !== undefined && gameState === 'in-progress') {
			console.log('Handle guess called');
			fetch('/api/validate', {
				method: 'POST',
				body: JSON.stringify(currentGuess),
			})
				.then(async (res) => {
					// Get response from server
					const guessResponse: GuessResponse = await res.json();

					// Add guess response to row
					const newRow: RowData = { guessResult: guessResponse, player: currentGuess };
					setEvaluatedGuesses((prevEvaluatedGuesses) => [...prevEvaluatedGuesses, newRow]);

					// update game state
					if (guessResponse.isNameCorrect === true) {
						setGameState('won');
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
	return (
		<>
			<GameContainer guesses={evaluatedGuesses} />
			{/* Render search bar while in progress, render result when done */}
			{gameState === 'in-progress' ? <PlayerSearch className="mt-8" /> : <GameResult />}
		</>
	);
}
