'use client';

import { lazy, Suspense } from 'react';
import { Dialog } from '@/components/ui/dialog';
import type { Dataset } from '@/data/datasets';

const LazyFiltersContent = lazy(() => import('./filters-content'));

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dataset: Dataset;
};

export default function FiltersDialog({ open, onOpenChange, dataset }: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<Suspense>
				<LazyFiltersContent dataset={dataset} setOpen={onOpenChange} />
			</Suspense>
		</Dialog>
	);
}
