'use client';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { createContext, type Dispatch, type SetStateAction, useState, type PropsWithChildren } from 'react';

type GuessContextType = [FormattedPlayer[], Dispatch<SetStateAction<FormattedPlayer[]>>];

export const GuessContext = createContext<GuessContextType>([[], () => {}] as unknown as GuessContextType);

export default function GuessContextProvider({ children }: PropsWithChildren) {
	const playerState = useState<FormattedPlayer[]>([]);
	return <GuessContext.Provider value={playerState}>{children}</GuessContext.Provider>;
}
