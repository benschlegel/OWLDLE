'use client';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import {
	createContext,
	useContext,
	useState,
	useEffect,
	type PropsWithChildren,
	useRef,
	type Dispatch,
	type SetStateAction,
	type MutableRefObject,
} from 'react';

const LOCAL_STORAGE_GUESS_KEY = 'guesses';

type GuessContextType = {
	guesses: FormattedPlayer[];
	setGuesses: Dispatch<SetStateAction<FormattedPlayer[]>>;
	isOldState: MutableRefObject<boolean>;
};

// Create the context
const GuessStorageContext = createContext<GuessContextType>([[], () => {}] as unknown as GuessContextType);

// Custom hook for consuming the context
export const useGuessStorage = () => {
	const context = useContext(GuessStorageContext);
	if (!context) {
		throw new Error('useItems must be used within an ItemsProvider');
	}
	return context;
};

// The provider component that will wrap the app
export const GuessStorageContextProvider = ({ children }: PropsWithChildren) => {
	const [playerGuesses, setPlayerGuesses] = useState<FormattedPlayer[]>([]);
	const isOldState = useRef(false);

	// Sync state with localStorage, only on the client side
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const storedPlayers = localStorage.getItem(LOCAL_STORAGE_GUESS_KEY);
			if (storedPlayers) {
				setPlayerGuesses(JSON.parse(storedPlayers));
			}
		}
	}, []);

	// Update localStorage whenever items change
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(LOCAL_STORAGE_GUESS_KEY, JSON.stringify(playerGuesses));
		}
	}, [playerGuesses]);

	return <GuessStorageContext.Provider value={{ guesses: playerGuesses, setGuesses: setPlayerGuesses, isOldState }}>{children}</GuessStorageContext.Provider>;
};
