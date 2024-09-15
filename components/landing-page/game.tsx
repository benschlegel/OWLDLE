'use client';
import GameContainer, { type RowData } from '@/components/game-container/GameContainer';
import PlayerSearch from '@/components/game-container/search';
import { GuessContext } from '@/context/GuessContext';
import { PLAYERS } from '@/data/players/formattedPlayers';
import { useContext, useEffect } from 'react';

const DEFAULT_GUESSES: RowData[] = [
	{
		player: PLAYERS[93],
		guessResult: { isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false },
	},
];

export default function Game() {
	const [playerGuesses, setPlayerGuesses] = useContext(GuessContext);

	useEffect(() => {
		console.log('Guesses: ', playerGuesses);
	}, [playerGuesses]);
	return (
		<>
			<GameContainer guesses={DEFAULT_GUESSES} />
			<PlayerSearch className="mt-8" />
		</>
	);
}
