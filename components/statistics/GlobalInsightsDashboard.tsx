'use client';

import { useState } from 'react';
import { GlobalGamesCard } from '@/components/statistics/GlobalGamesCard';
import { OverviewSection } from '@/components/statistics/OverviewCharts';
import { defaultGrouping, TrendsOverTimeChart, type PerDayParams } from '@/components/statistics/PerDayChart';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { DEFAULT_DATASET_NAME, STATISTICS_PATHNAME } from '@/data/datasets';
import type { DayGrouping, DayScope } from '@/types/statistics';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const perDayParams: PerDayParams = { dataset: DEFAULT_DATASET_NAME, range: 'all', from: null, to: null };

export default function GlobalInsightsDashboard() {
	const [scope, setScope] = useState<DayScope>('all');
	const [groupingOverride, setGroupingOverride] = useState<DayGrouping | null>(null);
	const grouping = groupingOverride ?? defaultGrouping(undefined, undefined);
	const perDayControls = { grouping, setGrouping: setGroupingOverride, scope, setScope };

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-4">
			{/* Live all-time count, shown on both statistics pages. dataset only feeds the all-modes
			    histogram, so the default dataset is fine here (no selector on this page). */}
			<GlobalGamesCard dataset={DEFAULT_DATASET_NAME} />
			{/* OverviewSection renders its own "Global Metrics" header, which serves as the page title. */}
			<OverviewSection />

			{/* Statistics (trends) section */}
			<div className="sm:my-6 my-3">
				<Marker variant="separator">
					<MarkerContent>
						<h2 className="sm:text-3xl text-2xl font-owl text-primary-foreground">Statistics (Trends)</h2>
					</MarkerContent>
				</Marker>
				<p className="text-sm text-muted-foreground w-full justify-self-center text-center">
					Data about specific modes with more filters and trend visualization.
				</p>
			</div>

			{/* Use Trends over time chart as preview with "show more" button below */}
			<TrendsOverTimeChart params={perDayParams} {...perDayControls} />
			<div className="flex justify-center pt-1">
				<Button
					asChild
					size="lg"
					variant="outline"
					className="font-owl border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground/70">
					<Link href={STATISTICS_PATHNAME}>
						Show more
						<ArrowRight className="p-0.75" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
