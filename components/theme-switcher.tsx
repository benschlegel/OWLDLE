'use client';

import * as React from 'react';
import { ComputerIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCallback, useState } from 'react';

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	const handleThemeSwitch = (newTheme: string) => {
		// Ensure that the browser supports view transitions
		// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
		if ((document as any).startViewTransition && newTheme !== theme) {
			// Set the animation style to "angled"
			document.documentElement.dataset.style = 'angled';

			// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
			(document as any).startViewTransition(() => {
				setTheme(newTheme);
			});
		} else {
			setTheme(newTheme);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="p-0">
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="transition-colors duration-300">
				<DropdownMenuItem onClick={() => handleThemeSwitch('light')}>
					<div className="flex flex-row gap-2">
						<Sun className="w-4 h-4" />
						<p>Light</p>
					</div>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleThemeSwitch('dark')}>
					<div className="flex flex-row gap-2">
						<Moon className="w-4 h-4" />
						<p>Dark</p>
					</div>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleThemeSwitch('system')}>
					<div className="flex flex-row gap-2">
						<ComputerIcon className="w-4 h-4" />
						<p>System</p>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
