'use client';
import type { GameState } from '@/types/client';
import { createContext, type Dispatch, type SetStateAction, useState, type PropsWithChildren } from 'react';

type GameStateContextType = [GameState, Dispatch<SetStateAction<GameState>>];

export const GameStateContext = createContext<GameStateContextType>(['in-progress', () => {}] as unknown as GameStateContextType);

export default function GameStateContextProvider({ children }: PropsWithChildren) {
	const gameState = useState<GameState>('in-progress');
	return <GameStateContext.Provider value={gameState}>{children}</GameStateContext.Provider>;
}
