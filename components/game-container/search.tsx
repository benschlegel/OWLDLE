'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuessContext } from '@/context/GuessContext';
import { PLAYERS } from '@/data/players/formattedPlayers';
import { cn } from '@/lib/utils';
import { Calculator, Calendar, Check, Dices, Smile, UserIcon } from 'lucide-react';
import { useContext, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

const tempValues = ['abc', 'def', 'ghi', 'jkl', 'mno'];
export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [search, setSearch] = useState('');
	const [isSearchActive, setIsSearchActive] = useState(false);

	return (
		<Command className="mt-6 rounded-lg border shadow-md md:min-w-[450px]">
			<CustomCommandInput
				placeholder="Search for player..."
				onFocus={() => setIsSearchActive(true)}
				onClick={() => setIsSearchActive(true)}
				onBlur={() => setIsSearchActive(false)}
			/>
			<CommandList className={`${isSearchActive ? '' : 'hidden'}`}>
				<ScrollArea className="h-[200px]">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Players">
						{PLAYERS.map((player) => {
							return (
								<CommandItem key={`${player.team}-${player.team}`} onSelect={(e) => console.log(`Selected ${e}`)}>
									<UserIcon className="mr-2 h-4 w-4" />
									<span>{player.name}</span>
								</CommandItem>
							);
						})}
					</CommandGroup>
				</ScrollArea>
			</CommandList>
		</Command>
	);
}
