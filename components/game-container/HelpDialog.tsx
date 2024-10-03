'use client';
import HelpContent from '@/components/game-container/HelpContent';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CircleHelpIcon } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { cloneElement, type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

const localStorageKey = 'sawHelp';

export function HelpDialog({ children }: PropsWithChildren) {
	const [open, setOpen] = useQueryState('showHelp', parseAsBoolean.withDefault(false));
	const [mounted, setMounted] = useState(false);
	// setOpen(defaultVal);

	const TriggerButton = useMemo(
		() => (
			<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
				<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
			</Button>
		),
		[]
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
		setMounted(true);
		// Set to false after closing dialog for the first time
		if (open === false) {
			localStorage.setItem(localStorageKey, `${open}`);
		}
		console.log('Local storage: ', open);
	}, [open]);

	if (!mounted) {
		// biome-ignore lint/suspicious/noExplicitAny: other types for children did not work
		return cloneElement(TriggerButton as any, {
			onClick: (e) => e.preventDefault(), // Prevent any action before hydration
		});
	}

	return (
		<Dialog open={open} onOpenChange={(val) => (val === true ? setOpen(true) : setOpen(null))} aria-describedby="Tutorial on how to play the game">
			<DialogTrigger asChild>{TriggerButton}</DialogTrigger>
			{mounted && <HelpContent setIsOpen={setOpen} />}
		</Dialog>
	);
}
