'use client';
import HelpContent from '@/components/game-container/HelpContent';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { cloneElement, type PropsWithChildren, useEffect, useState } from 'react';

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
	const [mounted, setMounted] = useState(false);

	// Keep localStorage value in sync with state
	useEffect(() => {
		setMounted(true);
		localStorage.setItem(localStorageKey, `${open}`);
		// if (open === false && defaultVal === true) {
		// Set to false after closing dialog for the first time
		// }
	}, [open]);

	if (!mounted) {
		// biome-ignore lint/suspicious/noExplicitAny: other types for children did not work
		return cloneElement(children as any, {
			onClick: (e) => e.preventDefault(), // Prevent any action before hydration
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen} aria-describedby="Tutorial on how to play the game">
			<DialogTrigger asChild>{children}</DialogTrigger>
			{mounted && <HelpContent setIsOpen={setOpen} />}
		</Dialog>
	);
}
