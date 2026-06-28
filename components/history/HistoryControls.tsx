'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import HotkeyBadge from '@/components/ui/hotkey-badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { cn } from '@/lib/utils';

export type HistorySort = 'iteration' | 'winRate' | 'played';
export type HistoryOrder = 'asc' | 'desc';

type Props = {
	dataset: string;
	datasetName: string;
	onDatasetChange: (dataset: string) => void;
	search: string;
	onSearchChange: (value: string) => void;
	sort: HistorySort;
	order: HistoryOrder;
	onSortChange: (sort: HistorySort) => void;
};

function SortButton({ label, active, order, onClick }: { label: string; active: boolean; order: HistoryOrder; onClick: () => void }) {
	return (
		<Button data-slot="button" type="button" variant={active ? 'default' : 'outline'} size="sm" onClick={onClick} className="gap-1">
			{label}
			{active && (order === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
		</Button>
	);
}

export function DatasetPopover({ dataset, datasetName, onDatasetChange }: Pick<Props, 'dataset' | 'datasetName' | 'onDatasetChange'>) {
	const [open, setOpen] = useState(false);

	function selectDataset(value: string) {
		onDatasetChange(value);
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button type="button" variant="outline" size="sm" className="gap-1.5">
					<span className="max-w-[12rem] truncate">{datasetName}</span>
					<ChevronDown className="size-4 opacity-70" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-64 p-1">
				<div className="max-h-80 overflow-y-auto">
					<p className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Champion Series</p>
					{OWCS_DATASETS_REVERSED.map((d) => (
						<DatasetItem key={d.dataset} active={d.dataset === dataset} label={d.formattedName} onClick={() => selectDataset(d.dataset)} />
					))}
					<p className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Overwatch League</p>
					{OWL_DATASETS_REVERSED.map((d) => (
						<DatasetItem key={d.dataset} active={d.dataset === dataset} label={d.formattedName} onClick={() => selectDataset(d.dataset)} />
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default function HistoryControls({ dataset, datasetName, onDatasetChange, search, onSearchChange, sort, order, onSortChange }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	// Ctrl/Cmd+K focuses the search field.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, []);

	return (
		<div className="flex flex-col gap-2">
			{/* Search */}
			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					ref={inputRef}
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search by player name…"
					className="pl-9 pr-12"
					aria-label="Search history by player name"
				/>
				<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
					<HotkeyBadge hotkey="K" />
				</span>
			</div>

			{/* Sort + dataset */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<ButtonGroup>
					<SortButton label="Iteration" active={sort === 'iteration'} order={order} onClick={() => onSortChange('iteration')} />
					<SortButton label="Win %" active={sort === 'winRate'} order={order} onClick={() => onSortChange('winRate')} />
					<SortButton label="Games" active={sort === 'played'} order={order} onClick={() => onSortChange('played')} />
				</ButtonGroup>

				<div className="hidden sm:block">
					<DatasetPopover dataset={dataset} datasetName={datasetName} onDatasetChange={onDatasetChange} />
				</div>
			</div>
		</div>
	);
}

function DatasetItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary',
				active && 'bg-secondary/60 font-semibold'
			)}>
			{label}
		</button>
	);
}
