'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GuessContext } from '@/context/GuessContext';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';
import { useContext } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);

	return (
		<div className={cn('relative', className)}>
			<Input type="search" placeholder="Search..." className="pr-10" />
			<Button type="submit" size="icon" className="absolute right-0 top-0 h-full rounded-l-none">
				<Dices className="h-4 w-4" />
				<span className="sr-only">Search</span>
			</Button>
		</div>
	);
}
