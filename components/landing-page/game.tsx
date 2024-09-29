'use client';
import GameContainer from '@/components/game-container/GameContainer';
import GameResult from '@/components/game-container/GameResult';
import PlayerSearch from '@/components/game-container/search';
import SearchDialog from '@/components/game-container/search-dialog';
import useGameState from '@/hooks/use-game-state';

type Props = {
	slug: string;
};

export default function Game({ slug }: Props) {
	const [evaluatedGuesses, gameState, validatedData] = useGameState({ slug });

	return (
		<div className="pb-2">
			<GameContainer guesses={evaluatedGuesses} />
			{/* Render search bar while in progress, render result when done */}
			{gameState === 'in-progress' ? (
				<>
					<PlayerSearch className="mt-6" />
					<SearchDialog />
				</>
			) : (
				<GameResult results={evaluatedGuesses} validatedResponse={validatedData} iteration={validatedData?.iteration} />
			)}
		</div>
	);
}
