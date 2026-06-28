'use client';

import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistory } from '@/hooks/use-history';
import type { HistoryEntry } from '@/types/history';

const ROW_HEIGHT = 56; // button height in px
const GAP = 6; // vertical gap between buttons
const ITEM_SLOT = ROW_HEIGHT + GAP; // virtualizer slot height

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function HistoryRow({ entry, onSelect }: { entry: HistoryEntry; onSelect: (entry: HistoryEntry) => void }) {
	return (
		<button
			type="button"
			onClick={() => onSelect(entry)}
			style={{ height: ROW_HEIGHT }}
			className="flex w-full items-center justify-between gap-3 rounded-md bg-secondary/40 px-4 text-left transition-colors hover:bg-secondary">
			<div className="flex flex-col">
				<span className="font-semibold font-mono leading-tight">{entry.player}</span>
				<span className="text-xs text-muted-foreground">
					{formatDate(entry.date)} · #{entry.iteration}
				</span>
			</div>
			<span className="shrink-0 text-sm font-owl text-primary-foreground">{entry.played > 0 ? `${entry.winRate}% win` : 'No games'}</span>
		</button>
	);
}

export default function HistoryList({ dataset, onSelect }: { dataset: string; onSelect: (entry: HistoryEntry) => void }) {
	const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useHistory(dataset);
	const entries = data?.pages.flatMap((p) => p.entries) ?? [];

	const parentRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: entries.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => ITEM_SLOT,
		overscan: 5,
	});

	// Fetch the next page when the sentinel scrolls into view.
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
			},
			{ root: parentRef.current, threshold: 0.1 }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading) return <Skeleton className="h-96 rounded-lg" />;
	if (isError) return <p className="text-muted-foreground">Couldn't load history. Try again later.</p>;
	if (entries.length === 0) return <p className="text-center text-muted-foreground py-16 font-owl text-xl">No past puzzles yet.</p>;

	return (
		<Card className="p-2">
			{/* Fixed-height scroll container (for TanStack Virtual measure) */}
			<div ref={parentRef} className="max-h-112 overflow-y-auto pr-1">
				{/* Total height spacer so the scrollbar is correctly sized */}
				<div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => (
						<div
							key={virtualRow.key}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: ITEM_SLOT,
								transform: `translateY(${virtualRow.start}px)`,
							}}>
							<HistoryRow entry={entries[virtualRow.index]} onSelect={onSelect} />
						</div>
					))}
				</div>
				{/* Sentinel: triggers next-page fetch when visible */}
				<div ref={sentinelRef} className="h-1" />
			</div>
			{isFetchingNextPage && <p className="py-2 text-center text-xs text-muted-foreground">Loading more…</p>}
		</Card>
	);
}
