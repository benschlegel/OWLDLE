'use client';
import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { type DialogKey, useDialogState } from '@/hooks/use-dialog-param';

const LazyDialogContent = lazy(() => import('./settings-content'));

const DIALOG_KEY = 'settings' satisfies DialogKey;

export function SettingsDialog() {
	const { open, setOpen } = useDialogState(DIALOG_KEY);

	const toggleDialogOpen = useCallback(() => {
		const newOpenState = open !== true;
		setOpen(newOpenState);
	}, [open, setOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggleDialogOpen();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [toggleDialogOpen]);

	return (
		<Dialog open={open} onOpenChange={toggleDialogOpen} aria-describedby="Change system settings.">
			<Suspense>
				<LazyDialogContent setOpen={setOpen} />
			</Suspense>
		</Dialog>
	);
}
