'use client';
import React, { lazy, Suspense, useMemo } from 'react';
import GameContainer from '@/components/game-container/GameContainer';
import GameResult from '@/components/game-container/GameResult';
import PlayerSearch from '@/components/game-container/search';
import useGameState from '@/hooks/use-game-state';

// Use React.lazy to dynamically import SearchDialog
const SearchDialog = lazy(() => import('@/components/game-container/search-dialog'));

type Props = {
	slug: string;
};

// Wrap PlayerSearch with React.memo to prevent unnecessary re-renders
const MemoizedPlayerSearch = React.memo(PlayerSearch);

export default function Game({ slug }: Props) {
	const [evaluatedGuesses, gameState, validatedData] = useGameState({ slug });

	// Memoize the className to avoid triggering re-renders
	const playerSearchClassName = useMemo(() => 'mt-6', []);

	return (
		<div className="pb-2">
			<GameContainer guesses={evaluatedGuesses} />
			{/* Render search bar while in progress, render result when done */}
			{gameState === 'in-progress' ? (
				<>
					<MemoizedPlayerSearch className={playerSearchClassName} />
					<Suspense fallback={<div className="aria-hidden hidden" />}>
						<SearchDialog />
					</Suspense>
				</>
			) : (
				<GameResult results={evaluatedGuesses} validatedResponse={validatedData} iteration={validatedData?.iteration} />
			)}
		</div>
	);
}
