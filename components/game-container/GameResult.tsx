'use client';

import { useContext, useMemo } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import WinScreen from '@/components/game-container/win';
import LossScreen from '@/components/game-container/lose';
import type { ValidateResponse } from '@/types/server';
import type { RowData } from '@/components/game-container/GameContainer';
import { formatResult } from '@/lib/client';
import { GAME_CONFIG } from '@/lib/config';

type Props = {
	results: RowData[];
	iteration?: number;
	validatedResponse?: ValidateResponse;
};

export default function GameResult({ results, iteration, validatedResponse }: Props) {
	const [gameState, setGameState] = useContext(GameStateContext);

	// Memoize clipboard content
	const formattedResult = useMemo(() => {
		const guesses = results.map((row) => row.guessResult);
		const formatted = formatResult({
			gameName: GAME_CONFIG.gameName,
			gameIteration: iteration ?? 1,
			guesses: guesses,
			maxGuesses: GAME_CONFIG.maxGuesses,
		});
		return formatted;
	}, [results, iteration]);

	// Win/LossScreen automatically reset game state if timer hits 0/next game starts
	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <WinScreen nextReset={validatedResponse?.nextReset} formattedResult={formattedResult} />;
		case 'lost':
			return <LossScreen correctPlayer={validatedResponse?.correctPlayer.name} formattedResult={formattedResult} nextReset={validatedResponse?.nextReset} />;
	}
}
