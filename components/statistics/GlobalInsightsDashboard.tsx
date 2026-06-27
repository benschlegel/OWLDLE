'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { GlobalGamesCard } from '@/components/statistics/GlobalGamesCard';
import { OverviewSection } from '@/components/statistics/OverviewCharts';
import { StatisticsInfoDialog } from '@/components/statistics/StatisticsInfoDialog';
import { DEFAULT_DATASET_NAME } from '@/data/datasets';

export default function GlobalInsightsDashboard() {
	// Dev-only toggle (never shown/applied in production): read the real prod DB to verify the page.
	const isDev = process.env.NODE_ENV !== 'production';
	const [useProd, setUseProd] = useState(false);
	const prodOn = isDev && useProd;

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-4">
			<div className="flex items-center justify-end gap-2">
				{isDev && (
					<label className="sm:flex hidden items-center gap-2 text-xs text-muted-foreground select-none">
						<Switch size="sm" checked={useProd} onCheckedChange={(checked) => setUseProd(checked)} />
						Prod DB
					</label>
				)}
				{/* <StatisticsInfoDialog /> */}
			</div>
			{/* Live all-time count — shown on both statistics pages. dataset only feeds the all-modes
			    histogram, so the default dataset is fine here (no selector on this page). */}
			<GlobalGamesCard dataset={DEFAULT_DATASET_NAME} prod={prodOn} />
			{/* OverviewSection renders its own "Global Insights" header, which serves as the page title. */}
			<OverviewSection prod={prodOn} />
		</div>
	);
}
