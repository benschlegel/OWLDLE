'use client';
import { useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleHelpIcon } from 'lucide-react';
import { type DialogKey, useDialogState } from '@/hooks/use-dialog-param';
const LazyContent = lazy(() => import('./teams-content'));

const DIALOG_KEY = 'teams' satisfies DialogKey;

export function TeamsDialog() {
	const { open, setOpen } = useDialogState(DIALOG_KEY);

	const toggleDialogOpen = useCallback(() => {
		setOpen(open !== true);
	}, [open, setOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 's' && (e.altKey || e.metaKey)) {
				e.preventDefault();
				toggleDialogOpen();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [toggleDialogOpen]);

	return (
		<Dialog open={open} onOpenChange={toggleDialogOpen} aria-describedby="Teams for the current game">
			<Suspense>
				<LazyContent setOpen={setOpen} />
			</Suspense>
		</Dialog>
	);
}

export const HelpTriggerButton = (
	<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
		<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
	</Button>
);
