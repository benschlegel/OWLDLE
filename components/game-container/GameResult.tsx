'use client';

import { useContext, useMemo } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import WinScreen from '@/components/game-container/win';
import LossScreen from '@/components/game-container/lose';
import type { ValidateResponse } from '@/types/server';
import type { RowData } from '@/components/game-container/GameContainer';
import { formatResult } from '@/lib/client';
import { GAME_CONFIG } from '@/lib/config';
import { DatasetContext } from '@/context/DatasetContext';

type Props = {
	results: RowData[];
	iteration?: number;
	validatedResponse?: ValidateResponse;
};

export default function GameResult({ results, iteration, validatedResponse }: Props) {
	const [gameState, setGameState] = useContext(GameStateContext);
	const [dataset, _] = useContext(DatasetContext);

	// Memoize clipboard content
	const formattedResult = useMemo(() => {
		const guesses = results.map((row) => row.guessResult);
		const formatted = formatResult({
			gameName: GAME_CONFIG.gameName,
			gameIteration: iteration ?? 1,
			guesses: guesses,
			maxGuesses: GAME_CONFIG.maxGuesses,
			siteUrl: GAME_CONFIG.siteUrl,
			dataset: dataset.dataset,
		});
		return formatted;
	}, [results, iteration, dataset]);

	// Win/LossScreen automatically reset game state if timer hits 0/next game starts
	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <WinScreen nextReset={validatedResponse?.nextReset} formattedResult={formattedResult} dataset={dataset.dataset} />;
		case 'lost':
			return (
				<LossScreen
					correctPlayer={validatedResponse?.correctPlayer.name}
					formattedResult={formattedResult}
					nextReset={validatedResponse?.nextReset}
					dataset={dataset.dataset}
				/>
			);
	}
}
