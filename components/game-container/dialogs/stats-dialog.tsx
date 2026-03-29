'use client';
import { lazy, Suspense, useCallback, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { type DialogKey, useDialogState } from '@/hooks/use-dialog-param';

const LazyDialogContent = lazy(() => import('./stats-content'));

const DIALOG_KEY = 'stats' satisfies DialogKey;

export function StatsDialog() {
	const { open, setOpen } = useDialogState(DIALOG_KEY);

	const toggleDialogOpen = useCallback(() => {
		const newOpenState = open !== true;
		setOpen(newOpenState);
	}, [open, setOpen]);

	return (
		<Dialog open={open} onOpenChange={toggleDialogOpen} aria-describedby="Game stats.">
			<Suspense>
				<LazyDialogContent setOpen={setOpen} />
			</Suspense>
		</Dialog>
	);
}
