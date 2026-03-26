'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISSED_KEY = 'pwa-install-dismissed';

export function usePWAInstall() {
	const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
	const [canInstall, setCanInstall] = useState(false);

	useEffect(() => {
		function handleBeforeInstallPrompt(e: Event) {
			e.preventDefault();
			deferredPromptRef.current = e as BeforeInstallPromptEvent;
			setCanInstall(true);
		}

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
	}, []);

	const install = useCallback(async () => {
		const prompt = deferredPromptRef.current;
		if (!prompt) return;

		await prompt.prompt();
		const { outcome } = await prompt.userChoice;

		if (outcome === 'accepted') {
			deferredPromptRef.current = null;
			setCanInstall(false);
		}
	}, []);

	const showBanner = canInstall && !isDismissed();

	const dismissBanner = useCallback(() => {
		try {
			localStorage.setItem(DISMISSED_KEY, '1');
		} catch {}
	}, []);

	return { canInstall, showBanner, install, dismissBanner };
}

function isDismissed(): boolean {
	try {
		return localStorage.getItem(DISMISSED_KEY) === '1';
	} catch {
		return false;
	}
}
