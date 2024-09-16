'use client';
import GameContainer, { type RowData } from '@/components/game-container/GameContainer';
import PlayerSearch from '@/components/game-container/search';
import { GuessContext } from '@/context/GuessContext';
import { type FormattedPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';
import { useContext, useEffect, useState } from 'react';

export default function Game() {
	const [playerGuesses, _] = useContext(GuessContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		// Ensure that the max guesses are respected
		if (playerGuesses.length <= GAME_CONFIG.maxGuesses) {
			const latestGuess: FormattedPlayer = playerGuesses[playerGuesses.length - 1];
			if (latestGuess !== undefined) {
				fetch('/api/validate', {
					method: 'POST',
					body: JSON.stringify(latestGuess),
				}).then(async (res) => {
					const guessRespones: GuessResponse = await res.json();
					const newRow: RowData = { guessResult: guessRespones, player: latestGuess };
					setEvaluatedGuesses((prevEvaluatedGuesses) => [...prevEvaluatedGuesses, newRow]);
				});
			}
		}
	}, [playerGuesses]);
	return (
		<>
			<GameContainer guesses={evaluatedGuesses} />
			<PlayerSearch className="mt-8" />
		</>
	);
}
