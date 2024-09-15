'use client';
import type { Player } from '@/types/players';
import { createContext, type Dispatch, type SetStateAction, useState, type PropsWithChildren } from 'react';

export const GuessContext = createContext<[Player[], Dispatch<SetStateAction<Player[]>>] | undefined>(undefined);

export default function GuessContextProvider({ children }: PropsWithChildren) {
	const playerState = useState<Player[]>([]);
	return <GuessContext.Provider value={playerState}>{children}</GuessContext.Provider>;
}
