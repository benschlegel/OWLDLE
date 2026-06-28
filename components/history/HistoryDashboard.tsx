'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import HistoryControls from '@/components/history/HistoryControls';
import HistoryDetailDialog from '@/components/history/HistoryDetailDialog';
import HistoryList from '@/components/history/HistoryList';
import RandomGameSection from '@/components/history/RandomGameSection';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { datasetInfo } from '@/data/datasets';
import { buildHistoryView } from '@/lib/history-view';
import { useHistory } from '@/hooks/use-history';
import { useHistoryParams } from '@/hooks/use-history-params';
import type { HistoryEntry } from '@/types/history';

const RANDOM_ANCHOR = 'game-logs';

// Same as live game search (components/game-container/search.tsx).
const FUSE_OPTIONS: IFuseOptions<HistoryEntry> = {
	keys: [{ name: 'player', weight: 1 }],
	threshold: 0.4,
	ignoreLocation: true,
	minMatchCharLength: 1,
};

export default function HistoryDashboard() {
	const [{ mode, iteration, stage, sort, order }, setParams] = useHistoryParams();
	const dataset = datasetInfo.find((d) => d.dataset === mode);
	const datasetName = dataset?.formattedName ?? mode;

	const { data, isLoading, isError } = useHistory(mode);
	const allEntries = useMemo(() => data?.entries ?? [], [data]);

	const [search, setSearch] = useState('');

	const fuse = useMemo(() => new Fuse(allEntries, FUSE_OPTIONS), [allEntries]);
	const searchActive = search.trim().length > 0;
	const filteredEntries = useMemo(() => (searchActive ? fuse.search(search.trim()).map((r) => r.item) : allEntries), [fuse, search, searchActive, allEntries]);
	const view = useMemo(() => buildHistoryView(filteredEntries, { sort, order, searchActive }), [filteredEntries, sort, order, searchActive]);
	const multiStage = useMemo(() => new Set(allEntries.map((e) => e.stageNumber)).size > 1, [allEntries]);

	// Entry shown immediately in the dialog header before the detail query resolves.
	const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

	const isOpenEntry = useCallback((e: HistoryEntry) => e.iteration === iteration && e.stage === (stage ?? 'current'), [iteration, stage]);

	useEffect(() => {
		if (iteration == null) {
			setSelectedEntry(null);
			return;
		}
		const found = allEntries.find(isOpenEntry) ?? null;
		setSelectedEntry((prev) => (prev && isOpenEntry(prev) ? prev : found));
	}, [iteration, allEntries, isOpenEntry]);

	// Prev/next = adjacency within the current sorted+filtered view. Up the list = newer.
	const currentIndex = iteration != null ? view.rows.findIndex(isOpenEntry) : -1;
	const newerEntry = currentIndex > 0 ? view.rows[currentIndex - 1] : null;
	const olderEntry = currentIndex >= 0 && currentIndex < view.rows.length - 1 ? view.rows[currentIndex + 1] : null;

	function openEntry(entry: HistoryEntry) {
		setSelectedEntry(entry);
		setParams({ iteration: entry.iteration, stage: entry.stage });
	}

	function handleSortChange(next: typeof sort) {
		if (next === sort) setParams({ order: order === 'asc' ? 'desc' : 'asc' });
		else setParams({ sort: next, order: 'desc' });
	}

	// URL anchor: reflect the random section in the hash as it scrolls into view, and respect deep link on mount.
	const randomRef = useRef<HTMLElement>(null);
	useEffect(() => {
		const el = randomRef.current;
		if (!el) return;
		if (window.location.hash === `#${RANDOM_ANCHOR}`) el.scrollIntoView({ behavior: 'auto', block: 'start' });
		const observer = new IntersectionObserver(
			([e]) => {
				const onSection = e.isIntersecting && e.intersectionRatio >= 0.5;
				const hash = `#${RANDOM_ANCHOR}`;
				if (onSection && window.location.hash !== hash) history.replaceState(null, '', hash);
				else if (!onSection && window.location.hash === hash) history.replaceState(null, '', window.location.pathname + window.location.search);
			},
			{ threshold: [0, 0.5, 1] }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	// Scope scroll-snap to this page only (window scroller).
	useEffect(() => {
		const prev = document.documentElement.style.scrollSnapType;
		document.documentElement.style.scrollSnapType = 'y proximity';
		return () => {
			document.documentElement.style.scrollSnapType = prev;
		};
	}, []);

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-8">
			<section className="flex flex-col gap-4 snap-start scroll-mt-20">
				<header className="flex flex-col gap-1">
					<h1 className="sm:text-4xl text-3xl font-owl text-primary-foreground">History</h1>
					{/* <p className="text-lg font-owl tracking-wide text-muted-foreground">{datasetName}</p> */}
				</header>

				<HistoryControls
					dataset={mode}
					datasetName={datasetName}
					onDatasetChange={(v) => setParams({ mode: v as typeof mode, iteration: null, stage: null })}
					search={search}
					onSearchChange={setSearch}
					sort={sort}
					order={order}
					onSortChange={handleSortChange}
				/>

				<HistoryList
					items={view.items}
					grouped={view.grouped}
					showStage={multiStage}
					showPlayed={sort === 'played'}
					isLoading={isLoading}
					isError={isError}
					onSelect={openEntry}
				/>
			</section>

			<section ref={randomRef} id={RANDOM_ANCHOR} className="flex flex-col gap-3 snap-start scroll-mt-20 min-h-[60vh] mt-5">
				<Marker variant="separator">
					<MarkerContent>
						<h2 className="sm:text-xl text-lg font-owl text-foreground">completed game logs</h2>
					</MarkerContent>
				</Marker>
				<RandomGameSection />
			</section>

			<HistoryDetailDialog
				dataset={mode}
				iteration={iteration}
				stage={stage}
				entry={selectedEntry}
				newerEntry={newerEntry}
				olderEntry={olderEntry}
				onClose={() => setParams({ iteration: null, stage: null })}
				onNavigate={openEntry}
			/>
		</div>
	);
}
