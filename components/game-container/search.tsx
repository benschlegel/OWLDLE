'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GuessContext } from '@/context/GuessContext';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';
import { useContext, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

const tempValues = ['abc', 'def', 'ghi', 'jkl', 'mno'];
export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [search, setSearch] = useState('');

	return (
		<div className={cn('relative mx-4', className)}>
			<Input type="search" placeholder="Search for player..." className="pr-10" value={search} onChange={(e) => setSearch(e.target.value)} />
			<Button
				type="submit"
				size="icon"
				className="absolute right-0 top-0 h-full rounded-l-none"
				onClick={() =>
					setGuesses([...guesses, { country: 'AD', name: search, role: 'Damage', team: 'LosAngelesGladiators', isEastern: true, countryImg: 'sad', id: 28 }])
				}>
				<Dices className="h-4 w-4" />
				<span className="sr-only">Search</span>
			</Button>
		</div>
	);
}
