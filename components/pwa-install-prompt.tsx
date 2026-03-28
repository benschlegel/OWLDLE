'use client';

import { Button } from '@/components/ui/button';
import { usePWA } from '@/components/pwa-provider';

export function PWAInstallPrompt() {
	const { showBanner, install, dismissBanner } = usePWA();

	if (!showBanner) return null;

	return (
		<div className="sm:hidden fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-border bg-card p-4 shadow-lg">
			<div className="flex items-start gap-3">
				<div className="flex-1 flex flex-col gap-2">
					<p className="font-medium text-foreground">Install App</p>
					<p className="text-sm text-muted-foreground leading-tight">Install as app for a better experience.</p>
				</div>
				<div className="flex gap-2">
					<Button variant={'ghost'} onClick={dismissBanner} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
						Later
					</Button>
					<Button onClick={install} className="rounded-md bg-primary-foreground px-3 text-sm text-white/90 hover:bg-primary-foreground/90 py-1 h-auto">
						Install
					</Button>
				</div>
			</div>
		</div>
	);
}
