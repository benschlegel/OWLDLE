'use client';
import GameContainer, { type RowData } from '@/components/game-container/GameContainer';
import PlayerSearch from '@/components/game-container/search';
import { GuessContext } from '@/context/GuessContext';
import { useContext, useEffect } from 'react';

const DEFAULT_GUESSES: RowData[] = [
	{
		player: { name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior', isEastern: true },
		guessResult: { isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false },
	},
];

export default function Game() {
	const [guesses, setGuesses] = useContext(GuessContext);

	useEffect(() => {
		console.log('Guesses: ', guesses);
	}, [guesses]);
	return (
		<>
			<GameContainer guesses={DEFAULT_GUESSES} />
			<PlayerSearch className="mt-8" />
		</>
	);
}
