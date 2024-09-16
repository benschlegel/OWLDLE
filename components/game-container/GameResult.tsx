'use client';

import { useContext, useEffect, useState } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import WinScreen from '@/components/game-container/win';
import LossScreen from '@/components/game-container/lose';
import type { ValidateResponse } from '@/types/server';

export default function GameResult() {
	const [gameState, setGameState] = useContext(GameStateContext);
	const [validatedData, setValidatedData] = useState<ValidateResponse>();
	useEffect(() => {
		fetch('/api/validate?getplayer=true')
			.then((response) => response.json())
			.then((data) => setValidatedData(data));
	}, []);

	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <WinScreen nextReset={validatedData?.nextReset} />;
		case 'lost':
			return <LossScreen correctPlayer={validatedData?.correctPlayer} nextReset={validatedData?.nextReset} />;
	}
}
