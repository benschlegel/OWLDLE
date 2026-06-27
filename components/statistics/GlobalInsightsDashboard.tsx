'use client';

import { GlobalGamesCard } from '@/components/statistics/GlobalGamesCard';
import { OverviewSection } from '@/components/statistics/OverviewCharts';
import { DEFAULT_DATASET_NAME } from '@/data/datasets';

export default function GlobalInsightsDashboard() {
	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-4">
			{/* Live all-time count, shown on both statistics pages. dataset only feeds the all-modes
			    histogram, so the default dataset is fine here (no selector on this page). */}
			<GlobalGamesCard dataset={DEFAULT_DATASET_NAME} />
			{/* OverviewSection renders its own "Global Metrics" header, which serves as the page title. */}
			<OverviewSection />
		</div>
	);
}
