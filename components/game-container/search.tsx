'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { DatasetContext } from '@/context/DatasetContext';
import { GuessContext } from '@/context/GuessContext';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { GAME_CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Combobox } from '@base-ui/react/combobox';
import type { Player } from '@/types/players';
import { Dices, Search, UserIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [dataset, setDataset] = useContext(DatasetContext);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
	const [inputValue, setInputValue] = useState('');
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();
	const isMobile = useIsMobile();
	const players = dataset.playerData;

	const handleSubmit = useCallback(() => {
		if (selectedPlayer !== null) {
			const player = selectedPlayer;
			setInputValue('');
			setSelectedPlayer(null);
			if (isMobile) inputRef.current?.blur();

			if (guesses.length < GAME_CONFIG.maxGuesses) {
				if (!guesses.some((g) => g.name === player.name)) {
					setGuesses([...guesses, player as FormattedPlayer]);
				} else {
					toast({
						title: '❌ Duplicate guess',
						description: 'You already guessed that player.',
					});
				}
			}
		}
	}, [selectedPlayer, setGuesses, guesses, toast, isMobile]);

	const filterItems = useCallback((item: Player, query: string) => {
		return item.name.toLowerCase().includes(query.toLowerCase());
	}, []);

	// Reset state when dataset changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger on dataset change
	useEffect(() => {
		setInputValue('');
		setSelectedPlayer(null);
		setOpen(false);
	}, [dataset.dataset]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'y' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				inputRef.current?.focus();
				setOpen(true);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<Combobox.Root
			key={dataset.dataset}
			items={players as readonly Player[]}
			value={selectedPlayer}
			onValueChange={(player) => {
				setSelectedPlayer(player as Player);
			}}
			inputValue={inputValue}
			onInputValueChange={(value, eventDetails) => {
				setInputValue(value as string);
				// Only clear selection when user is actively typing
				if (eventDetails.reason === 'input-change' || eventDetails.reason === 'input-clear') {
					setSelectedPlayer(null);
				}
			}}
			open={open}
			onOpenChange={(isOpen) => setOpen(isOpen)}
			filter={filterItems}
			itemToStringLabel={(player) => player.name}
			itemToStringValue={(player) => player.name}
			openOnInputClick
			autoHighlight
			loopFocus>
			<Combobox.InputGroup
				className={cn('rounded-lg border border-secondary bg-popover text-popover-foreground md:min-w-[450px] mb-4 transition-colors duration-300', className)}>
				<ButtonGroup className="w-full">
					<div data-slot="input" className="flex items-center px-3 grow">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						<Combobox.Input
							ref={inputRef}
							placeholder="Search for player..."
							className="flex h-11 w-full bg-transparent py-3 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-[16px] sm:text-base"
							onKeyDown={(e) => {
								if (e.key === 'Enter' && selectedPlayer !== null && !open) {
									e.preventDefault();
									handleSubmit();
								}
							}}
						/>
					</div>
					<Button
						data-slot="button"
						type="button"
						variant="default"
						size="lg"
						onClick={handleSubmit}
						disabled={selectedPlayer === null}
						aria-label="Guess"
						className="px-4">
						<div className="flex flex-row gap-2">
							<p className="sm:text-lg text-base tracking-tight">Guess</p>
							<div className="flex items-center justify-center">
								<Dices className="h-4 w-4" />
								<span className="sr-only">Guess</span>
							</div>
						</div>
					</Button>
				</ButtonGroup>
			</Combobox.InputGroup>

			<Combobox.Portal>
				<Combobox.Positioner className="z-50" style={{ width: 'var(--anchor-width)' }} sideOffset={4} side="bottom">
					<Combobox.Popup className="max-h-46 overflow-y-auto rounded-lg border border-secondary bg-popover text-popover-foreground shadow-md">
						<Combobox.Empty className="py-6 text-center text-sm empty:hidden">No results found.</Combobox.Empty>
						<Combobox.List className="p-1 data-empty:hidden">
							{(player: Player) => (
								<Combobox.Item
									key={`${player.name}-${player.team}`}
									value={player}
									className="relative flex cursor-default select-none items-center rounded-sm px-2 h-11 text-[16px] outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground">
									<UserIcon className="mr-2 h-4 w-4" />
									<span>{player.name}</span>
								</Combobox.Item>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
