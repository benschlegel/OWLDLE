'use client';

import { lazy, Suspense } from 'react';
import { Dialog } from '@/components/ui/dialog';
import type { Dataset } from '@/data/datasets';
import type { EndlessFilters } from '@/store/endless-store';

const LazyLeaderboardContent = lazy(() => import('./leaderboard-content'));

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dataset: Dataset;
	filters: EndlessFilters;
};

export default function LeaderboardDialog({ open, onOpenChange, dataset, filters }: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Suspense>
				<LazyLeaderboardContent open={open} dataset={dataset} filters={filters} />
			</Suspense>
		</Dialog>
	);
}
