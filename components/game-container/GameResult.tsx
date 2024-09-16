'use client';

import { useContext } from 'react';
import { GameStateContext } from '@/context/GameStateContext';

export default function GameResult() {
	const [gameState, setGameState] = useContext(GameStateContext);

	switch (gameState) {
		case 'in-progress':
			return <></>;
		case 'won':
			return <p>You won!</p>;
		case 'lost':
			return <p>You lost...</p>;
	}
}
