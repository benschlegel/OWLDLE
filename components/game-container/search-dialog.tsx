'use client';

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatasetContext } from '@/context/DatasetContext';
import { GuessContext } from '@/context/GuessContext';
import { type FormattedPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import type { Player } from '@/types/players';
import { UserIcon } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	placeholder?: string;
}

export default function SearchDialog({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [dataset, setDataset] = useContext(DatasetContext);
	const [searchValue, setSearchValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();
	const players = dataset.playerData;

	const [open, setOpen] = useState(false);

	// Called when item is selected from dropdown (through click or enter)
	const handleItemSubmit = (e: string) => {
		const player: Player = JSON.parse(e);
		// Submit guess (if guesses remain)
		if (guesses.length < GAME_CONFIG.maxGuesses) {
			if (!guesses.some((g) => g.name === player.name)) {
				// Send guess (if player wasnt already guessed)
				setGuesses([...guesses, player as FormattedPlayer]);
				setOpen(false);
			} else {
				// Show toast if player was already guessed
				toast({
					title: '❌ Duplicate guess',
					description: 'You already guessed that player.',
				});
			}
		}
	};

	const handleTyping = (e: React.FormEvent<HTMLInputElement>) => {
		setSearchValue(e.currentTarget.value);
	};

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			// Focus search on ctrl + y
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<CommandDialog open={open} onOpenChange={setOpen} srDialogTitle="Search for player">
			<CommandInput placeholder="Search for player..." value={searchValue} onChangeCapture={handleTyping} ref={inputRef} />
			<CommandList className="py-2 overflow-visible">
				<ScrollArea className="h-[17rem]">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="">
						{players.map((player) => {
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
		</CommandDialog>
	);
}
