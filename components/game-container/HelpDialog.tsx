'use client';
import { useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleHelpIcon } from 'lucide-react';
import { type DialogKey, useDialogState } from '@/hooks/use-dialog-param';
const LazyHelpContent = lazy(() => import('@/components/game-container/HelpContent'));

const LOCAL_STORAGE_KEY = 'sawHelp';
const DIALOG_KEY = 'help' satisfies DialogKey;

export function HelpDialog() {
	const { open, setOpen } = useDialogState(DIALOG_KEY);
	const [shouldOpenOnMount, setShouldOpenOnMount] = useState(false);

	useEffect(() => {
		// Check localStorage on mount
		const sawHelp = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (sawHelp === null) {
			setShouldOpenOnMount(true);
		}
	}, []);

	useEffect(() => {
		// Open dialog after initial render if needed
		if (shouldOpenOnMount) {
			setOpen(true);
			setShouldOpenOnMount(false);
			localStorage.setItem(LOCAL_STORAGE_KEY, String(true));
		}
	}, [shouldOpenOnMount, setOpen]);

	const toggleDialogOpen = useCallback(() => {
		setOpen(open !== true);
	}, [open, setOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggleDialogOpen();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [toggleDialogOpen]);

	return (
		<Dialog open={open} onOpenChange={toggleDialogOpen} aria-describedby="Tutorial on how to play the game">
			<DialogTrigger asChild>{HelpTriggerButton}</DialogTrigger>
			<Suspense>
				<LazyHelpContent setOpen={setOpen} />
			</Suspense>
		</Dialog>
	);
}

export const HelpTriggerButton = (
	<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
		<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
	</Button>
);
