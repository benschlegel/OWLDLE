'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import WinScreen from '@/components/game-container/win';
import LossScreen from '@/components/game-container/lose';
import type { ValidateResponse } from '@/types/server';
import { useToast } from '@/hooks/use-toast';
import type { RowData } from '@/components/game-container/GameContainer';
import { Button } from '@/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { formatResult } from '@/lib/client';
import { GAME_CONFIG } from '@/lib/config';

type Props = {
	results: RowData[];
	iteration?: number;
	validatedResponse?: ValidateResponse;
};

export default function GameResult({ results, iteration, validatedResponse }: Props) {
	const [gameState, setGameState] = useContext(GameStateContext);
	const [validatedData, setValidatedData] = useState<ValidateResponse>();
	const { toast } = useToast();

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

	useEffect(() => {
		fetch('/api/validate?getplayer=true')
			.then((response) => response.json())
			.catch(() => {
				toast({
					title: "Can't reach server",
					description: "Couldn't reach server",
				});
			})
			.then((data) => setValidatedData(data));
	}, [toast]);

	// Win/LossScreen automatically reset game state if timer hits 0/next game starts
	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <WinScreen nextReset={validatedData?.nextReset} formattedResult={formattedResult} />;
		case 'lost':
			return <LossScreen correctPlayer={validatedData?.correctPlayer.name} formattedResult={formattedResult} nextReset={validatedData?.nextReset} />;
	}
}
