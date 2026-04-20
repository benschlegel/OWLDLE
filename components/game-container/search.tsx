'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxList } from '@/components/ui/combobox';
import { DatasetContext } from '@/context/DatasetContext';
import { GuessContext } from '@/context/GuessContext';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import { ENDLESS_PATHNAME } from '@/data/datasets';
import { getDisabledTeams } from '@/data/disabledTeams';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { GAME_CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';
import type { Player } from '@/types/players';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { useVirtualizer } from '@tanstack/react-virtual';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { Dices, Search, UserIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const ITEM_HEIGHT = 44;

const FUSE_OPTIONS: IFuseOptions<Player> = {
	keys: [
		{ name: 'name', weight: 0.7 },
		// { name: 'team', weight: 0.3 },
	],
	threshold: 0.4,
	ignoreLocation: true,
	minMatchCharLength: 1,
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export default function PlayerSearch({ className }: Props) {
	const [guesses, setGuesses] = useContext(GuessContext);
	const [dataset] = useContext(DatasetContext);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
	const [inputValue, setInputValue] = useState('');
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();
	const isMobile = useIsMobile();
	const pathname = usePathname();
	const players = useMemo(() => {
		if (pathname === ENDLESS_PATHNAME) return dataset.playerData;
		const disabled = getDisabledTeams(dataset.dataset);
		if (disabled.length === 0) return dataset.playerData;
		return dataset.playerData.filter((p) => !disabled.includes(p.team as string));
	}, [dataset, pathname]);

	// Fuse.js lazy initialization, index is only built on first non-empty query (perf optimization)
	const fuseRef = useRef<Fuse<Player> | null>(null);
	const fusePlayersRef = useRef<unknown>(null);

	const filteredPlayers = useMemo(() => {
		const q = inputValue.trim();
		if (!q) return players as Player[];

		// Recreate fuse index when player data changes
		if (!fuseRef.current || fusePlayersRef.current !== players) {
			fuseRef.current = new Fuse(players as Player[], FUSE_OPTIONS);
			fusePlayersRef.current = players;
		}

		return fuseRef.current.search(q).map((r) => r.item);
	}, [inputValue, players]);

	// TanStack Virtual
	const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

	const virtualizer = useVirtualizer({
		count: filteredPlayers.length,
		getScrollElement: () => scrollElement,
		estimateSize: () => ITEM_HEIGHT,
		overscan: 8,
	});

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
		<Combobox
			key={dataset.dataset}
			items={players as readonly Player[]}
			filteredItems={filteredPlayers}
			value={selectedPlayer}
			onValueChange={(player) => {
				setSelectedPlayer(player as Player);
			}}
			inputValue={inputValue}
			onInputValueChange={(value, eventDetails) => {
				setInputValue(value as string);
				if (eventDetails.reason === 'input-change' || eventDetails.reason === 'input-clear') {
					setSelectedPlayer(null);
				}
				// Reset virtual scroll on input change
				if (scrollElement) scrollElement.scrollTop = 0;
			}}
			open={open}
			onOpenChange={(isOpen) => setOpen(isOpen)}
			filter={null}
			itemToStringLabel={(player) => player.name}
			itemToStringValue={(player) => player.name}
			openOnInputClick
			autoHighlight
			loopFocus
			virtualized
			onItemHighlighted={(itemValue) => {
				if (!itemValue) return;
				const index = filteredPlayers.findIndex((p) => p.name === (itemValue as Player).name);
				if (index !== -1) {
					virtualizer.scrollToIndex(index, { align: 'auto' });
				}
			}}>
			<ComboboxPrimitive.InputGroup
				className={cn('rounded-lg border border-secondary bg-popover text-popover-foreground md:min-w-[450px] mb-4 transition-colors duration-300', className)}>
				<ButtonGroup className="w-full">
					<div data-slot="input" className="flex items-center px-3 grow">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						<ComboboxPrimitive.Input
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
			</ComboboxPrimitive.InputGroup>

			<ComboboxContent sideOffset={4} className="border border-secondary ring-0 min-w-(--anchor-width)">
				<ComboboxEmpty className="py-6 text-center text-sm">No results found.</ComboboxEmpty>
				<ComboboxList ref={setScrollElement} className="max-h-46 p-1">
					<div
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative',
						}}>
						{virtualizer.getVirtualItems().map((virtualRow) => {
							const player = filteredPlayers[virtualRow.index];
							if (!player) return null;
							return (
								<ComboboxPrimitive.Item
									key={`${player.name}-${player.team}`}
									value={player}
									className="relative flex cursor-default select-none items-center rounded-sm px-2 h-11 text-[16px] outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}>
									<UserIcon className="mr-2 h-4 w-4" />
									<span>{player.name}</span>
								</ComboboxPrimitive.Item>
							);
						})}
					</div>
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
