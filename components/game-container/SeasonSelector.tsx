'use client';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCallback, useState } from 'react';

export default function SeasonSelector() {
	const [season, setSeason] = useState('season1');

	const handleChange = useCallback((value: string) => {
		// TODO: implement
	}, []);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
					<p className="text-2xl font-mono font-semibold tracking-wide">S1</p>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="px-1">
				<DropdownMenuLabel>Select season</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={season} onValueChange={handleChange}>
					<DropdownMenuRadioItem value="season1">Season 1 (2018)</DropdownMenuRadioItem>
					<DropdownMenuItem disabled>More coming soon...</DropdownMenuItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
