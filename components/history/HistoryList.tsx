'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { Skeleton } from '@/components/ui/skeleton';
import type { HistoryViewItem } from '@/lib/history-view';
import type { HistoryEntry } from '@/types/history';

const ROW_HEIGHT = 56; // button height in px
const GAP = 6; // vertical gap between buttons
const ROW_SLOT = ROW_HEIGHT + GAP; // virtualizer slot height for a row
const MARKER_SLOT = 48; // virtualizer slot height for a stage separator marker

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function HistoryRow({
	entry,
	showStage,
	showPlayed,
	onSelect,
}: { entry: HistoryEntry; showStage: boolean; showPlayed: boolean; onSelect: (entry: HistoryEntry) => void }) {
	let value: string;
	if (entry.played === 0) value = 'No games';
	else if (showPlayed) value = `${entry.played.toLocaleString()} games`;
	else value = `${entry.winRate}% win`;
	return (
		<button
			type="button"
			onClick={() => onSelect(entry)}
			style={{ height: ROW_HEIGHT }}
			className="flex w-full items-center justify-between cursor-pointer gap-3 rounded-md dark:bg-secondary/40 bg-background  px-4 text-left transition-colors hover:bg-secondary">
			<div className="flex flex-col">
				<span className="font-semibold font-mono leading-tight">{entry.player}</span>
				<span className="text-xs text-muted-foreground">
					{formatDate(entry.date)} · #{entry.iteration}
					{showStage ? ` · ${entry.stageLabel}` : ''}
				</span>
			</div>
			<span className="shrink-0 text-sm font-owl text-primary-foreground">{value}</span>
		</button>
	);
}

type Props = {
	items: HistoryViewItem[];
	grouped: boolean;
	showStage: boolean;
	showPlayed: boolean;
	isLoading: boolean;
	isError: boolean;
	onSelect: (entry: HistoryEntry) => void;
};

export default function HistoryList({ items, grouped, showStage, showPlayed, isLoading, isError, onSelect }: Props) {
	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => (items[index].type === 'marker' ? MARKER_SLOT : ROW_SLOT),
		overscan: 8,
	});

	if (isLoading) return <LoadingSkeleton />;
	if (isError) return <p className="text-muted-foreground">Couldn't load history. Try again later.</p>;
	if (items.length === 0) return <p className="text-center text-muted-foreground py-16 font-owl text-xl">No matching puzzles.</p>;

	return (
		<Card className="p-2">
			<div ref={parentRef} className="max-h-120 overflow-y-auto pr-1 scroll-fade-10 scroll-fade scrollbar-none">
				<div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const item = items[virtualRow.index];
						return (
							<div
								key={virtualRow.key}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: virtualRow.size,
									transform: `translateY(${virtualRow.start}px)`,
								}}>
								{item.type === 'marker' ? (
									<div className="flex h-full items-center px-1 py-2">
										<Marker variant="separator">
											<MarkerContent>
												<h2 className="sm:text-xl text-lg font-owl text-foreground">{item.stageLabel}</h2>
											</MarkerContent>
										</Marker>
									</div>
								) : (
									<HistoryRow entry={item.entry} showStage={!grouped && showStage} showPlayed={showPlayed} onSelect={onSelect} />
								)}
							</div>
						);
					})}
				</div>
			</div>
		</Card>
	);
}

function LoadingSkeleton() {
	return (
		<Skeleton className="h-124.5 rounded-lg p-2 flex flex-col gap-1.5 pr-5.5 pl-2.5">
			<Skeleton className="h-14 bg-secondary/40" />
			<Skeleton className="h-14 bg-secondary/40" />
			<Skeleton className="h-14 bg-secondary/40" />
			<Skeleton className="h-14 bg-secondary/40" />
			<Skeleton className="h-14 bg-secondary/40" />
			<Skeleton className="h-14 bg-secondary/40" />
			<Skeleton className="h-14 bg-secondary/40" />
		</Skeleton>
	);
}
