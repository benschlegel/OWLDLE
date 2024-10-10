'use client';

import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { createContext, type Dispatch, type SetStateAction, useState, type PropsWithChildren } from 'react';
type GuessContextType = [CombinedFormattedPlayer[], Dispatch<SetStateAction<CombinedFormattedPlayer[]>>];

export const GuessContext = createContext<GuessContextType>([[], () => {}] as unknown as GuessContextType);

export default function GuessContextProvider({ children }: PropsWithChildren) {
	const playerState = useState<CombinedFormattedPlayer[]>([]);
	return <GuessContext.Provider value={playerState}>{children}</GuessContext.Provider>;
}
