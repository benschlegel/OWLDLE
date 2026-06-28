'use client';

import { useEffect, useState } from 'react';
import HistoryList from '@/components/history/HistoryList';
import HistoryDetailDialog from '@/components/history/HistoryDetailDialog';
import SeasonSelectDropdown from '@/components/season-selector/SeasonSelectDropdown';
import { Card, CardContent } from '@/components/ui/card';
import { datasetInfo } from '@/data/datasets';
import { useHistoryParams } from '@/hooks/use-history-params';
import { useHistory } from '@/hooks/use-history';
import type { HistoryEntry } from '@/types/history';

export default function HistoryDashboard() {
	const [{ mode, iteration }, setParams] = useHistoryParams();
	const dataset = datasetInfo.find((d) => d.dataset === mode);
	const shorthand = dataset?.shorthand ?? mode;
	const datasetName = dataset?.formattedName ?? mode;

	// Shared history data, same cache key as HistoryList.
	const { data: historyData } = useHistory(mode);
	const allEntries = historyData?.pages.flatMap((p) => p.entries) ?? [];

	// Entry shown immediately in the dialog header before the detail query resolves.
	const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

	// Sync selectedEntry when the URL iteration changes.
	useEffect(() => {
		if (iteration == null) {
			setSelectedEntry(null);
			return;
		}
		const found = allEntries.find((e) => e.iteration === iteration) ?? null;
		setSelectedEntry((prev) => (prev?.iteration === iteration ? prev : found));
	}, [iteration, allEntries]);

	// Entries are sorted DESC. Prev = older (higher index), next = newer (lower index).
	const currentIndex = iteration != null ? allEntries.findIndex((e) => e.iteration === iteration) : -1;
	const prevIteration = currentIndex >= 0 && currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1].iteration : null;
	const nextIteration = currentIndex > 0 ? allEntries[currentIndex - 1].iteration : null;

	function handleSelect(entry: HistoryEntry) {
		setSelectedEntry(entry);
		setParams({ iteration: entry.iteration });
	}

	function handleNavigate(it: number) {
		const entry = allEntries.find((e) => e.iteration === it) ?? null;
		setSelectedEntry(entry);
		setParams({ iteration: it });
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-owl text-primary-foreground">History</h1>
					<p className="text-lg font-owl tracking-wide text-muted-foreground">{datasetName}</p>
				</div>
				<SeasonSelectDropdown value={mode} currentShorthand={shorthand} onValueChange={(v) => setParams({ mode: v as typeof mode, iteration: null })} />
			</header>

			{/* Top section: history list */}
			<HistoryList dataset={mode} onSelect={handleSelect} />

			{/* Bottom section: placeholder */}
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground font-owl">More coming soon</CardContent>
			</Card>

			<HistoryDetailDialog
				dataset={mode}
				iteration={iteration}
				entry={selectedEntry}
				prevIteration={prevIteration}
				nextIteration={nextIteration}
				onClose={() => setParams({ iteration: null })}
				onNavigate={handleNavigate}
			/>
		</div>
	);
}
