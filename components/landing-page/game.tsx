'use client';
import GameContainer, { type RowData } from '@/components/game-container/GameContainer';
import PlayerSearch from '@/components/game-container/search';
import { GuessContext } from '@/context/GuessContext';
import { type FormattedPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import type { GuessResponse } from '@/types/server';
import { useContext, useEffect, useState } from 'react';

const DEFAULT_GUESSES: RowData[] = [
	{
		player: PLAYERS[93],
		guessResult: { isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false },
	},
];

export default function Game() {
	const [playerGuesses, setPlayerGuesses] = useContext(GuessContext);
	const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);

	// Evaluate guess every time new guess comes in from GuessContext, merge and set new evaluated guesses
	useEffect(() => {
		const latestGuess: FormattedPlayer = playerGuesses[playerGuesses.length - 1];
		if (latestGuess !== undefined) {
			console.log('Guess: ', latestGuess);
			fetch('/api/validate', {
				method: 'POST',
				body: JSON.stringify(latestGuess),
			}).then(async (res) => {
				const guessRespones: GuessResponse = await res.json();
				const newRow: RowData = { guessResult: guessRespones, player: latestGuess };
				console.log('new row: ', newRow);
				setEvaluatedGuesses((prevEvaluatedGuesses) => [...prevEvaluatedGuesses, newRow]);
			});
		}
	}, [playerGuesses]);
	return (
		<>
			<GameContainer guesses={evaluatedGuesses} />
			<PlayerSearch className="mt-8" />
		</>
	);
}
