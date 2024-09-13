'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, MoonIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
	const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

	useEffect(() => {
		// Apply the theme to the document
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}
	}, [theme]);
	return (
		<>
			<div className="flex flex-row justify-between items-center w-full">
				<Button variant="ghost" size="icon" className="p-0">
					<InfoIcon className="h-6 w-6" />
				</Button>
				<div className="mb-3">
					<h1 className="text-4xl font-bold text-center">
						<span className="text-primary-foreground">OWL</span>
						<span className="text-primary-foreground/70">S1</span>LE
					</h1>
				</div>
				<Button variant="ghost" size="icon" onClick={() => setTheme('light')}>
					<MoonIcon className="h-6 w-6" />
				</Button>
			</div>
			<Separator className="mb-4 mt-1" />
		</>
	);
}
