'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

type BeforeInstallPromptEvent = Event & {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISSED_KEY = 'pwa-install-dismissed';
const GAME_COMPLETED_KEY = 'pwa-game-completed';
const GAME_COMPLETED_EVENT = 'pwa-game-completed';
const AUTO_PROMPTED_KEY = 'pwa-auto-prompted';

function hasAutoPrompted(): boolean {
	try {
		return localStorage.getItem(AUTO_PROMPTED_KEY) === '1';
	} catch {
		return false;
	}
}

function isDismissed(): boolean {
	try {
		return localStorage.getItem(DISMISSED_KEY) === '1';
	} catch {
		return false;
	}
}

function hasCompletedGameInStorage(): boolean {
	try {
		return localStorage.getItem(GAME_COMPLETED_KEY) === '1';
	} catch {
		return false;
	}
}

export function markGameCompleted() {
	try {
		localStorage.setItem(GAME_COMPLETED_KEY, '1');
	} catch {}
	window.dispatchEvent(new Event(GAME_COMPLETED_EVENT));
}

type PWAContextValue = {
	isOnline: boolean;
	isInstalled: boolean;
	canInstall: boolean;
	showBanner: boolean;
	install: () => Promise<void>;
	dismissBanner: () => void;
};

const PWAContext = createContext<PWAContextValue>({
	isOnline: true,
	isInstalled: false,
	canInstall: false,
	showBanner: false,
	install: async () => {},
	dismissBanner: () => {},
});

function subscribeOnline(callback: () => void) {
	window.addEventListener('online', callback);
	window.addEventListener('offline', callback);
	return () => {
		window.removeEventListener('online', callback);
		window.removeEventListener('offline', callback);
	};
}

function getOnlineSnapshot() {
	return navigator.onLine;
}

function getServerSnapshot() {
	return true;
}

function subscribeDisplayMode(callback: () => void) {
	const mql = window.matchMedia('(display-mode: standalone)');
	mql.addEventListener('change', callback);
	return () => mql.removeEventListener('change', callback);
}

function getDisplayModeSnapshot() {
	return window.matchMedia('(display-mode: standalone)').matches;
}

function getDisplayModeServerSnapshot() {
	return false;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
	const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerSnapshot);
	const isInstalled = useSyncExternalStore(subscribeDisplayMode, getDisplayModeSnapshot, getDisplayModeServerSnapshot);

	const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
	const [canInstall, setCanInstall] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const [hasCompletedGame, setHasCompletedGame] = useState(false);

	useEffect(() => {
		setDismissed(isDismissed());
		setHasCompletedGame(hasCompletedGameInStorage());

		function handleGameCompleted() {
			setHasCompletedGame(true);
		}
		window.addEventListener(GAME_COMPLETED_EVENT, handleGameCompleted);

		function handleBeforeInstallPrompt(e: Event) {
			e.preventDefault();
			const promptEvent = e as BeforeInstallPromptEvent;
			deferredPromptRef.current = promptEvent;
			setCanInstall(true);

			// Auto-show native prompt on first visit instead of waiting for user interaction.
			if (!hasAutoPrompted()) {
				try {
					localStorage.setItem(AUTO_PROMPTED_KEY, '1');
				} catch {}
				promptEvent.prompt().then(() => {
					deferredPromptRef.current = null;
					setCanInstall(false);
				});
			}
		}

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener(GAME_COMPLETED_EVENT, handleGameCompleted);
		};
	}, []);

	const install = useCallback(async () => {
		const prompt = deferredPromptRef.current;
		if (prompt) {
			await prompt.prompt();
			const { outcome } = await prompt.userChoice;
			if (outcome === 'accepted') {
				deferredPromptRef.current = null;
				setCanInstall(false);
			}
		}
	}, []);

	const dismissBanner = useCallback(() => {
		try {
			localStorage.setItem(DISMISSED_KEY, '1');
		} catch {}
		setDismissed(true);
	}, []);

	const showBanner = canInstall && !dismissed && hasCompletedGame;

	const value = useMemo(
		() => ({ isOnline, isInstalled, canInstall, showBanner, install, dismissBanner }),
		[isOnline, isInstalled, canInstall, showBanner, install, dismissBanner]
	);

	return <PWAContext value={value}>{children}</PWAContext>;
}

export function usePWA() {
	return useContext(PWAContext);
}
