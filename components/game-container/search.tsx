'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuessContext } from '@/context/GuessContext';
import { PLAYERS } from '@/data/players/formattedPlayers';
import type { Player } from '@/types/players';
import { UserIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

type SearchState = 'unfocused' | 'typing' | 'ready' | 'submitting';

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
	const [searchState, setSearchState] = useState<SearchState>('unfocused');
	const [searchValue, setSearchValue] = useState('');

	const closeSearch = useCallback(() => {
		setTimeout(() => {
			setSearchState('unfocused');
		}, 150);
	}, []);

	const handleSubmit = useCallback(() => {
		if (selectedPlayer !== undefined) {
			if (searchState === 'submitting') {
				console.log('Submitted: ', selectedPlayer);
			}
		}
	}, [selectedPlayer, searchState]);

	const handleItemSubmit = (e: string) => {
		const player: Player = JSON.parse(e);
		setSearchValue(player.name);
		setSelectedPlayer(JSON.parse(e));
		setSearchState('submitting');
	};

	const handleTyping = (e: React.FormEvent<HTMLInputElement>) => {
		setSearchValue(e.currentTarget.value);
		setSearchState('typing');
		setSelectedPlayer(undefined);
	};

	useEffect(() => {
		console.log('State: ', searchState);
	}, [searchState]);
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
				onButtonClick={() => console.log('Player: ', selectedPlayer)}
				placeholder="Search for player..."
				value={searchValue}
				onChangeCapture={handleTyping}
				onFocus={() => setSearchState('typing')}
				onBlur={closeSearch}
				onKeyDownCapture={(event) => {
					if (event.key === 'Enter') {
						if (searchState === 'ready') {
							setSearchState('submitting');
						} else if (searchState === 'submitting') {
							handleSubmit();
						}
					}
				}}
				isButtonDisabled={selectedPlayer === undefined}
			/>
			<CommandList className={`${searchState === 'typing' ? '' : 'sr-only'}`}>
				<ScrollArea className="sm:h-[11rem] h-[15rem]">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="">
						{PLAYERS.map((player) => {
							return (
								<CommandItem value={JSON.stringify(player)} key={`${player.name}-${player.team}`} onSelect={handleItemSubmit}>
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
