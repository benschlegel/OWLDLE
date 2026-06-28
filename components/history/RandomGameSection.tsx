'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Dices } from 'lucide-react';
import GameLogGrid from '@/components/history/GameLogGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Dataset, getDataset, OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { useRandomGame } from '@/hooks/use-random-game';
import { cn } from '@/lib/utils';

/** Strip a `-stageN` suffix to get the base dataset key. */
function baseDataset(key: string): string {
	return key.replace(/-stage\d+$/, '');
}

function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function RandomGameSection() {
	const [mode, setMode] = useState<string>('all');
	const [modeOpen, setModeOpen] = useState(false);
	const { current, reroll } = useRandomGame(mode);

	const modeLabel = mode === 'all' ? 'All modes' : getDataset(mode as Dataset)?.formattedName ?? mode;
	const currentDatasetName = current ? getDataset(baseDataset(current.datasetKey) as Dataset)?.formattedName ?? current.datasetKey : '';

	function selectMode(value: string) {
		setMode(value);
		setModeOpen(false);
	}

	// "r" reroll hotkey (ignored while typing in a field).
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const el = e.target as HTMLElement | null;
			if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
			if (e.key === 'r' || e.key === 'R') {
				e.preventDefault();
				reroll();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [reroll]);

	return (
		<div className="flex flex-col sm:gap-4 gap-1">
			<p className="text-sm text-muted-foreground text-center">
				Roll a random, anonymous game played by someone across any dataset and replay how their board looked. Hit reroll for a new one.
			</p>

			<div className="flex flex-wrap items-center justify-center gap-2 sm:my-0 my-2">
				<Popover open={modeOpen} onOpenChange={setModeOpen}>
					<PopoverTrigger asChild>
						<Button type="button" variant="outline" className="gap-1.5">
							<span className="max-w-48 truncate">{modeLabel}</span>
							<ChevronDown className="size-4 opacity-70" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="center" className="w-64 p-1">
						<div className="max-h-80 overflow-y-auto">
							<ModeItem label="All modes" active={mode === 'all'} onClick={() => selectMode('all')} />
							<p className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Champion Series</p>
							{OWCS_DATASETS_REVERSED.map((d) => (
								<ModeItem key={d.dataset} label={d.formattedName} active={mode === d.dataset} onClick={() => selectMode(d.dataset)} />
							))}
							<p className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Overwatch League</p>
							{OWL_DATASETS_REVERSED.map((d) => (
								<ModeItem key={d.dataset} label={d.formattedName} active={mode === d.dataset} onClick={() => selectMode(d.dataset)} />
							))}
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{current && (
				<Card className="w-full max-w-lg mx-auto">
					<CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-sm sm:grid-cols-2">
						<InfoItem label="Dataset" value={currentDatasetName} />
						<InfoItem label="Answer" value={current.answer} isRightAligned />
					</CardContent>
				</Card>
			)}

			{/* Cap the grid width to match main game layout (max-w-lg, centered). */}
			<div className="w-full max-w-lg mx-auto">
				<GameLogGrid game={current} />
			</div>

			<div className="max-w-lg mx-auto w-full">
				<Button
					type="button"
					onClick={reroll}
					className="gap-2 border-primary-foreground border-2 w-full focus-visible:ring-primary-foreground hover:bg-primary-foreground/40"
					variant="outline">
					<Dices className="size-4" />
					Reroll
					<Kbd>r</Kbd>
				</Button>
			</div>

			{current && (
				<Card className="w-full max-w-lg mx-auto">
					<CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-sm sm:grid-cols-2">
						<InfoItem label="Iteration" value={`#${current.iteration}`} />
						<InfoItem label="Finished" value={formatDateTime(current.finishedAt)} isRightAligned />
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function ModeItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

function InfoItem({ label, value, isRightAligned = false }: { label: string; value: string; isRightAligned?: boolean }) {
	return (
		<div className="flex flex-col">
			<span className={cn('text-xs uppercase tracking-wide text-muted-foreground font-semibold', isRightAligned && 'text-right')}>{label}</span>
			<span className={cn('font-owl text-foreground truncate', isRightAligned && 'text-right')}>{value}</span>
		</div>
	);
}
