'use client';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

const LazyDialogContent = lazy(() => import('./stats-content'));

export function StatsDialog() {
	const [open, setOpen] = useState(false);

	const toggleDialogOpen = useCallback(() => {
		const newOpenState = open !== true;
		setOpen(newOpenState);
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={toggleDialogOpen} aria-describedby="Game stats.">
			<Suspense>
				<LazyDialogContent setOpen={setOpen} />
			</Suspense>
		</Dialog>
	);
}
