'use client';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuessContext } from '@/context/GuessContext';
import { type FormattedPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import type { Player } from '@/types/players';
import { UserIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

type SearchState = 'unfocused' | 'typing' | 'submitting';

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
	const [searchState, setSearchState] = useState<SearchState>('unfocused');
	const [searchValue, setSearchValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const closeSearch = useCallback(() => {
		setTimeout(() => {
			setSearchState('unfocused');
		}, 150);
	}, []);

	// Called when player is selected
	const handleSubmit = useCallback(() => {
		if (selectedPlayer !== undefined) {
			// Reset search state
			setSearchState('unfocused');
			setSearchValue('');
			setSelectedPlayer(undefined);

			// Submit guess (if guesses remain)
			if (guesses.length < GAME_CONFIG.maxGuesses) {
				if (!guesses.some((g) => g.name === selectedPlayer.name)) {
					// Send guess (if player wasnt already guessed)
					setGuesses([...guesses, selectedPlayer as FormattedPlayer]);
				} else {
					// Show toast if player was already guessed
					toast({
						title: 'Duplicate guess',
						description: 'You already guessed that player.',
					});
				}
			}
		}
	}, [selectedPlayer, setGuesses, guesses, toast]);

	// Called when item is selected from dropdown (through click or enter)
	const handleItemSubmit = (e: string) => {
		if (searchState !== 'unfocused') {
			const player: Player = JSON.parse(e);
			setSearchValue(player.name);
			setSelectedPlayer(JSON.parse(e));
			setSearchState('submitting');
		}
	};

	const handleTyping = (e: React.FormEvent<HTMLInputElement>) => {
		setSearchValue(e.currentTarget.value);
		setSearchState('typing');
		setSelectedPlayer(undefined);
	};

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			// Focus search on ctrl + y
			if (e.key === 'y' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<Command
			loop
			className="mt-6 rounded-lg border border-secondary shadow-sm md:min-w-[450px]"
			filter={(value, search) => {
				// Manually add filter to fix weird bug where items are unsorted if using built-in filter fn
				if (value.toLowerCase().includes(search.toLowerCase())) return 1;
				return 0;
			}}>
			<CustomCommandInput
				onButtonClick={handleSubmit}
				placeholder="Search for player..."
				value={searchValue}
				onChangeCapture={handleTyping}
				onFocus={() => setSearchState('typing')}
				onClick={() => setSearchState('typing')}
				ref={inputRef}
				onBlur={closeSearch}
				onKeyDownCapture={(event) => {
					if (event.key === 'Enter') {
						if (searchState === 'submitting') {
							handleSubmit();
						}
					} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
						setSearchState('typing');
					}
				}}
				isButtonDisabled={selectedPlayer === undefined}
			/>
			<CommandList className={`${searchState === 'typing' ? '' : 'sr-only'}`}>
				<ScrollArea className="sm:h-[10rem] h-[15rem]">
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
