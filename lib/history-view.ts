import type { HistoryEntry } from '@/types/history';
import type { HistoryOrder, HistorySort } from '@/components/history/HistoryControls';

export type HistoryViewItem = { type: 'marker'; key: string; stageLabel: string; stageNumber: number } | { type: 'row'; key: string; entry: HistoryEntry };

export type HistoryView = {
	/** Flat, ordered list of rows (no markers), used for prev/next navigation. */
	rows: HistoryEntry[];
	/** Render list including stage separator markers (markers only in the default iteration view). */
	items: HistoryViewItem[];
	/** Whether stage markers are shown (false: rows show their stage inline). */
	grouped: boolean;
};

function entryKey(e: HistoryEntry): string {
	return `${e.datasetKey}:${e.iteration}`;
}

/**
 * Sort already-filtered history entries and build the render list.
 * - `iteration` sort groups by stage (markers), `order` flips BOTH the stage order and the iteration
 *   order within each stage. Disabled (no markers) while a search is active.
 * - `winRate` / `played` sort are global (no markers); rows show their stage inline.
 */
export function buildHistoryView(entries: HistoryEntry[], opts: { sort: HistorySort; order: HistoryOrder; searchActive: boolean }): HistoryView {
	const dir = opts.order === 'asc' ? 1 : -1;
	const grouped = opts.sort === 'iteration' && !opts.searchActive;

	const rows = [...entries];
	if (opts.sort === 'winRate') {
		rows.sort((a, b) => (a.winRate - b.winRate) * dir || b.played - a.played || b.iteration - a.iteration);
	} else if (opts.sort === 'played') {
		rows.sort((a, b) => (a.played - b.played) * dir || b.winRate - a.winRate || b.iteration - a.iteration);
	} else {
		// Order flips both the stage blocks and the iterations inside them.
		rows.sort((a, b) => (a.stageNumber - b.stageNumber) * dir || (a.iteration - b.iteration) * dir);
	}

	const items: HistoryViewItem[] = [];
	if (grouped) {
		let lastStage: number | null = null;
		// Only emit markers when more than one stage is present.
		const multiStage = new Set(rows.map((r) => r.stageNumber)).size > 1;
		for (const entry of rows) {
			if (multiStage && entry.stageNumber !== lastStage) {
				items.push({ type: 'marker', key: `marker-${entry.stageNumber}`, stageLabel: entry.stageLabel, stageNumber: entry.stageNumber });
				lastStage = entry.stageNumber;
			}
			items.push({ type: 'row', key: entryKey(entry), entry });
		}
	} else {
		for (const entry of rows) items.push({ type: 'row', key: entryKey(entry), entry });
	}

	return { rows, items, grouped };
}
