'use client';

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CustomCommandInput } from '@/components/ui/command';
import { DatasetContext } from '@/context/DatasetContext';
import { GuessContext } from '@/context/GuessContext';
import { type CombinedFormattedPlayer, type FormattedPlayer, PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';
import type { Player } from '@/types/players';
import { UserIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

type SearchState = 'unfocused' | 'typing' | 'submitting';

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [dataset, setDataset] = useContext(DatasetContext);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
	const [searchState, setSearchState] = useState<SearchState>('unfocused');
	const [searchValue, setSearchValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();
	const players = dataset.playerData;

	const closeSearch = useCallback(() => {
		// TODO: find better workaround
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
						title: '❌ Duplicate guess',
						description: 'You already guessed that player.',
					});
				}
			}
		}
	}, [selectedPlayer, setGuesses, guesses, toast]);

	// Called when item is selected from dropdown (through click or enter)
	const handleItemSubmit = useCallback(
		(e: string) => {
			if (searchState !== 'unfocused') {
				const player: Player = JSON.parse(e);
				setSearchValue(player.name);
				setSelectedPlayer(JSON.parse(e));
				setSearchState('submitting');
			}
		},
		[searchState]
	);

	const filterSearch = useCallback((value: string, search: string, keywords?: string[]) => {
		// Manually add filter to fix weird bug where items are unsorted if using built-in filter fn
		const parsed = JSON.parse(value) as CombinedFormattedPlayer;
		if (parsed.name.toLowerCase().includes(search.toLowerCase())) return 1;
		return 0;
	}, []);

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
			className={cn('rounded-lg border border-secondary shadow-sm md:min-w-[450px] mb-4 transition-colors duration-300 ', className)}
			onBlur={closeSearch}
			filter={filterSearch}>
			<CustomCommandInput
				onButtonClick={handleSubmit}
				placeholder="Search for player..."
				value={searchValue}
				onChangeCapture={handleTyping}
				onFocus={() => setSearchState('typing')}
				onClick={() => setSearchState('typing')}
				ref={inputRef}
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
			<CommandList className={`${searchState === 'typing' ? '' : 'hidden'} max-h-[200px] h-[--cmdk-list-height] transition-[height] duration-200`}>
				{/* <ScrollArea className="sm:h-[10rem] h-[15rem]"> */}
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="">
					{players.map((player) => {
						return (
							<CommandItem
								value={JSON.stringify(player)}
								key={`${player.name}-${player.team}`}
								onSelect={handleItemSubmit}
								className="text-[16px] sm:text-[16px] sm:py-[0.43rem]">
								<UserIcon className="mr-2 h-4 w-4" />
								<span>{player.name}</span>
							</CommandItem>
						);
					})}
				</CommandGroup>
				{/* </ScrollArea> */}
			</CommandList>
		</Command>
	);
}
