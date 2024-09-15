'use client';
import type { Player } from '@/types/players';
import { createContext, type Dispatch, type SetStateAction, useState, type PropsWithChildren } from 'react';

type GuessContextType = [Player[], Dispatch<SetStateAction<Player[]>>];

export const GuessContext = createContext<GuessContextType>([] as unknown as GuessContextType);

export default function GuessContextProvider({ children }: PropsWithChildren) {
	const playerState = useState<Player[]>([]);
	return <GuessContext.Provider value={playerState}>{children}</GuessContext.Provider>;
}
