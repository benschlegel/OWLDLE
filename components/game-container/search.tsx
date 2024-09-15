'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuessContext } from '@/context/GuessContext';
import { cn } from '@/lib/utils';
import { Calculator, Calendar, Check, Dices, Smile } from 'lucide-react';
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
				<CommandEmpty>No results found.</CommandEmpty>
				<ScrollArea className="h-[200px]">
					<CommandGroup heading="Suggestions">
						<CommandItem>
							<Calendar className="mr-2 h-4 w-4" />
							<span>Calendar</span>
						</CommandItem>
						<CommandItem>
							<Smile className="mr-2 h-4 w-4" />
							<span>Search Emoji</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
						<CommandItem disabled>
							<Calculator className="mr-2 h-4 w-4" />
							<span>Calculator</span>
						</CommandItem>
					</CommandGroup>
				</ScrollArea>
			</CommandList>
		</Command>
	);
}
