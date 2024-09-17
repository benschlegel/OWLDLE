'use client';
import GameContainer, { type RowData } from '@/components/game-container/GameContainer';
import GameResult from '@/components/game-container/GameResult';
import PlayerSearch from '@/components/game-container/search';
import SearchDialog from '@/components/game-container/search-dialog';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import useGameState from '@/hooks/use-game-state';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';
import { useCallback, useContext, useEffect, useState } from 'react';

export default function Game() {
	// const [playerGuesses, _] = useContext(GuessContext);
	// const [evaluatedGuesses, setEvaluatedGuesses] = useState<RowData[]>([]);
	// const [gameState, setGameState] = useContext(GameStateContext);
	// const [currentGuess, setCurrentGuess] = useState<FormattedPlayer | undefined>(undefined);
	// const { toast } = useToast();
	const [evaluatedGuesses, gameState] = useGameState();

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
				<GameResult results={evaluatedGuesses} />
			)}
		</>
	);
}
