'use client';

import { useContext } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import WinScreen from '@/components/game-container/win';
import LossScreen from '@/components/game-container/lose';

export default function GameResult() {
	const [gameState, setGameState] = useContext(GameStateContext);

	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <WinScreen />;
		case 'lost':
			return <LossScreen />;
	}
}
