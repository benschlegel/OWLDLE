'use client';

import * as React from 'react';
import { ComputerIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ModeToggle() {
	const { setTheme } = useTheme();

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
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<div className="flex flex-row gap-2">
						<Sun className="w-4 h-4" />
						<p>Light</p>
					</div>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<div className="flex flex-row gap-2">
						<Moon className="w-4 h-4" />
						<p>Dark</p>
					</div>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<div className="flex flex-row gap-2">
						<ComputerIcon className="w-4 h-4" />
						<p>System</p>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
