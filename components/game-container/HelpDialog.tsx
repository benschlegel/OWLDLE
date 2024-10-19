'use client';
import { useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { useQueryState, parseAsBoolean } from 'nuqs';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleHelpIcon } from 'lucide-react';
import { DEFAULT_DIALOG_VALUE, type DialogKey, useDialogParams } from '@/hooks/use-dialog-param';
// import HelpContent from '@/components/game-container/HelpContent';
const LazyHelpContent = lazy(() => import('@/components/game-container/HelpContent'));

const LOCAL_STORAGE_KEY = 'sawHelp';
const DIALOG_KEY = 'help' satisfies DialogKey;

export function HelpDialog() {
	const [dialog, setDialog] = useDialogParams();
	const [shouldOpenOnMount, setShouldOpenOnMount] = useState(false);
	const open = dialog === DIALOG_KEY;

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
			setDialog(DIALOG_KEY);
			setShouldOpenOnMount(false);
			localStorage.setItem(LOCAL_STORAGE_KEY, String(true));
		}
	}, [shouldOpenOnMount, setDialog]);

	const toggleDialogOpen = useCallback(() => {
		setDialog((prevDialog) => {
			return prevDialog === DEFAULT_DIALOG_VALUE ? DIALOG_KEY : DEFAULT_DIALOG_VALUE;
		});
	}, [setDialog]);

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
				<LazyHelpContent setDialog={setDialog} />
			</Suspense>
		</Dialog>
	);
}

export const HelpTriggerButton = (
	<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
		<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
	</Button>
);
