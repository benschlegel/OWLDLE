'use client';
import GameContainer from '@/components/game-container/GameContainer';
import GameResult from '@/components/game-container/GameResult';
import PlayerSearch from '@/components/game-container/search';
import SearchDialog from '@/components/game-container/search-dialog';
import useGameState from '@/hooks/use-game-state';

export default function Game() {
	const [evaluatedGuesses, gameState, validatedData] = useGameState();

	return (
		<>
			<GameContainer guesses={evaluatedGuesses} />
			{/* Render search bar while in progress, render result when done */}
			{gameState === 'in-progress' ? (
				<>
					<PlayerSearch className="mt-6" />
					<SearchDialog />
				</>
			) : (
				<GameResult results={evaluatedGuesses} validatedResponse={validatedData} />
			)}
		</>
	);
}
