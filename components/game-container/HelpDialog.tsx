'use client';
import HelpContent from '@/components/game-container/HelpContent';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CircleHelpIcon } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useCallback, useEffect } from 'react';

const localStorageKey = 'sawHelp';

export function HelpDialog() {
	const [open, setOpen] = useQueryState('showHelp', parseAsBoolean.withDefault(false));

	const TriggerButton = (
		<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
			<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
		</Button>
	);

	useEffect(() => {
		// Convoluted way to check to get value from localstorage and use it as default for the state (nextjs quirk with client components)
		let localStorageVal: string | null = '';
		if (typeof window !== 'undefined') {
			localStorageVal = localStorage.getItem(localStorageKey);
		}
		let defaultVal = true;
		if (localStorageVal && localStorageVal === 'false') {
			defaultVal = false;
		}
		if (defaultVal === true) {
			setOpen(true);
		}
	}, [setOpen]);

	// Keep localStorage value in sync with state
	useEffect(() => {
		// Set to false after closing dialog for the first time
		if (open === false) {
			localStorage.setItem(localStorageKey, `${open}`);
		}
	}, [open]);

	const toggleDialogOpen = useCallback(() => {
		setOpen(open === true ? null : true);
	}, [open, setOpen]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			// Focus search on ctrl + y
			if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggleDialogOpen();
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, [toggleDialogOpen]);

	return (
		<Dialog open={open} onOpenChange={toggleDialogOpen} aria-describedby="Tutorial on how to play the game">
			<DialogTrigger asChild>{TriggerButton}</DialogTrigger>
			<HelpContent setIsOpen={setOpen} />
		</Dialog>
	);
}
