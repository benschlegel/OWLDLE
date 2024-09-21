'use client';
import HelpContent from '@/components/game-container/HelpContent';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { type PropsWithChildren, type SetStateAction, useCallback, useEffect, useState } from 'react';

const localStorageKey = 'sawHelp';

export function HelpDialog({ children }: PropsWithChildren) {
	// Convoluted way to check to get value from localstorage and use it as default for the state (nextjs quirk with client components)
	let localStorageVal: string | null = '';
	if (typeof window !== 'undefined') {
		localStorageVal = localStorage.getItem(localStorageKey);
	}
	let defaultVal = true;
	if (localStorageVal && localStorageVal === 'false') {
		defaultVal = false;
	}
	const [open, setOpen] = useState(defaultVal);

	// Keep localStorage value in sync with state
	useEffect(() => {
		localStorage.setItem(localStorageKey, `${open}`);
		// if (open === false && defaultVal === true) {
		// }
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen} aria-describedby="Tutorial on how to play the game">
			<DialogTrigger asChild>{children}</DialogTrigger>
			<HelpContent setIsOpen={setOpen} />
		</Dialog>
	);
}
