'use client';

import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { Dataset } from '@/data/datasets';
import { getDatasetFilterConfig } from '@/data/endless-filter-config';
import { useDialogState } from '@/hooks/use-dialog-param';
import { useEndlessStore, type EndlessFilters } from '@/store/endless-store';

const DEFAULT_FILTERS: EndlessFilters = { regions: [], topTeamsOnly: false };

type Props = {
	dataset: Dataset;
	setOpen: (open: boolean) => void;
};

export default function FiltersContent({ dataset, setOpen }: Props) {
	const config = getDatasetFilterConfig(dataset);
	const filtersFromStore = useEndlessStore((s) => s.datasets[dataset]?.filters);
	const filters: EndlessFilters = filtersFromStore ?? DEFAULT_FILTERS;
	const updateFilters = useEndlessStore((s) => s.updateFilters);
	const { setOpen: setTeamsOpen } = useDialogState('teams');

	const regions = config?.regions ?? [];

	const isRegionActive = (region: string) => (filters.regions ?? []).length === 0 || (filters.regions ?? []).includes(region);

	const toggleRegion = (region: string) => {
		const current = filters.regions ?? [];
		let newRegions: string[];
		if (current.length === 0) {
			newRegions = regions.filter((r) => r !== region);
		} else if (current.includes(region)) {
			newRegions = current.filter((r) => r !== region);
			if (newRegions.length === 0) newRegions = [];
		} else {
			newRegions = [...current, region];
			if (newRegions.length === regions.length) newRegions = [];
		}
		updateFilters(dataset, { ...filters, regions: newRegions });
	};

	const toggleTopTeams = () => {
		updateFilters(dataset, { ...filters, topTeamsOnly: !filters.topTeamsOnly });
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle className="font-owl">Filters</DialogTitle>
			</DialogHeader>
			<div className="space-y-2.5">
				{regions.map((region) => (
					<div key={region} className="flex items-center justify-between">
						<Label htmlFor={`filter-dialog-region-${region}`} className="text-sm cursor-pointer w-full">
							{region}
						</Label>
						<Switch id={`filter-dialog-region-${region}`} checked={isRegionActive(region)} onCheckedChange={() => toggleRegion(region)} />
					</div>
				))}
				{regions.length > 0 && config?.topTeamsFilter && <Separator />}
				{config?.topTeamsFilter && (
					<div className="flex items-center justify-between">
						<Label htmlFor="filter-dialog-top-teams" className="text-sm cursor-pointer w-full">
							{config.topTeamsFilter.label}
						</Label>
						<Switch id="filter-dialog-top-teams" checked={filters.topTeamsOnly} onCheckedChange={toggleTopTeams} />
					</div>
				)}
				<p className="text-xs text-muted-foreground pt-0.5">Changing filters resets your streak.</p>
				<Button
					variant="outline"
					className="w-full py-1.5 h-auto bg-card justify-between"
					onClick={() => {
						setOpen(false);
						setTeamsOpen(true);
					}}>
					Show selected teams
					<Kbd className="font-mono sm:flex hidden opacity-95">alt+s</Kbd>
				</Button>
			</div>
		</DialogContent>
	);
}
