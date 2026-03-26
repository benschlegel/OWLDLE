'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

type PWAContextValue = {
	isOnline: boolean;
	isInstalled: boolean;
};

const PWAContext = createContext<PWAContextValue>({
	isOnline: true,
	isInstalled: false,
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

	const value = useMemo(() => ({ isOnline, isInstalled }), [isOnline, isInstalled]);

	return <PWAContext value={value}>{children}</PWAContext>;
}

export function usePWA() {
	return useContext(PWAContext);
}
