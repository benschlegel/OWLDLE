import GameContainer, { type RowData } from '@/components/wordle/GameContainer';
import PlayerSearch from '@/components/wordle/search';
import GuessContextProvider from '@/context/GuessContext';

const guesses: RowData[] = [
	{
		player: { name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior', isEastern: true },
		guessResult: { isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false },
	},
];

export default function Game() {
	return (
		<GuessContextProvider>
			<GameContainer guesses={guesses} />
			<PlayerSearch className="mt-8" />
		</GuessContextProvider>
	);
}
