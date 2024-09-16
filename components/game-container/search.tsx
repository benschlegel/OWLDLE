'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuessContext } from '@/context/GuessContext';
import { PLAYERS } from '@/data/players/formattedPlayers';
import type { Player } from '@/types/players';
import { UserIcon } from 'lucide-react';
import { useCallback, useContext, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
	const [isSearchActive, setIsSearchActive] = useState(false);

	const closeSearch = useCallback(() => {
		setTimeout(() => {
			setIsSearchActive(false);
		}, 100);
	}, []);
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
				onBlur={closeSearch}
				onKeyUp={(event) => {
					if (event.key === 'Enter' && selectedPlayer !== undefined && !isSearchActive) {
						console.log('Player: ', selectedPlayer);
					}
				}}
			/>
			<CommandList className={`${isSearchActive ? '' : 'sr-only'}`}>
				<ScrollArea className="sm:h-[11rem] h-[15rem]">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="">
						{PLAYERS.map((player) => {
							return (
								<CommandItem value={JSON.stringify(player)} key={`${player.name}-${player.team}`} onSelect={(e) => setSelectedPlayer(JSON.parse(e))}>
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
