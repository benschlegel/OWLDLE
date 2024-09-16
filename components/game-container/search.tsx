'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuessContext } from '@/context/GuessContext';
import { PLAYERS } from '@/data/players/formattedPlayers';
import { UserIcon } from 'lucide-react';
import { useContext, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

const tempValues = ['abc', 'def', 'ghi', 'jkl', 'mno'];
export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [search, setSearch] = useState('');
	const [isSearchActive, setIsSearchActive] = useState(false);

	// TODO: pass button state to enable/disable
	return (
		<Command
			loop
			className="mt-6 rounded-lg border border-secondary shadow-md md:min-w-[450px]"
			filter={(value, search) => {
				// Manually add filter to fix weird bug where items are unsorted if using built-in filter fn
				if (value.toLowerCase().includes(search.toLowerCase())) return 1;
				return 0;
			}}>
			<CustomCommandInput
				onButtonClick={() => console.log('Test')}
				placeholder="Search for player..."
				onFocus={() => setIsSearchActive(true)}
				onClick={() => setIsSearchActive(true)}
				onBlur={() =>
					// TODO: find better workaround
					setTimeout(() => {
						setIsSearchActive(false);
					}, 100)
				}
			/>
			<CommandList className={`${isSearchActive ? '' : 'sr-only'}`}>
				<ScrollArea className="sm:h-[11rem] h-[15rem]">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Players">
						{PLAYERS.map((player) => {
							return (
								<CommandItem value={JSON.stringify(player)} key={`${player.name}-${player.team}`} onSelect={(e) => console.log(`Selected ${e}`)}>
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
