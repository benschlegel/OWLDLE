'use client';

import { useContext, useEffect, useState } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import WinScreen from '@/components/game-container/win';
import LossScreen from '@/components/game-container/lose';
import type { ValidateResponse } from '@/types/server';
import { useToast } from '@/hooks/use-toast';

export default function GameResult() {
	const [gameState, setGameState] = useContext(GameStateContext);
	const [validatedData, setValidatedData] = useState<ValidateResponse>();
	const { toast } = useToast();

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

	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <WinScreen nextReset={validatedData?.nextReset} />;
		case 'lost':
			return <LossScreen correctPlayer={validatedData?.correctPlayer} nextReset={validatedData?.nextReset} />;
	}
}
