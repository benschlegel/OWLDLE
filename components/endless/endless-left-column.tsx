'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { Dataset } from '@/data/datasets';
import { useEndlessStore, type EndlessFilters } from '@/store/endless-store';
import { Flame, Trophy } from 'lucide-react';

type EndlessStats = {
	currentStreak: number;
	highestStreak: number;
};

const OWCS_S3_REGIONS = ['EMEA', 'NA', 'Korea', 'CN'] as const;
type OwcsS3Region = (typeof OWCS_S3_REGIONS)[number];

const DEFAULT_FILTERS: EndlessFilters = { regions: [], partnerOnly: false };

export default function EndlessLeftColumn({ stats, dataset }: { stats: EndlessStats; dataset: Dataset }) {
	return (
		<div className="hidden xl:block absolute right-full top-endless-top mr-layout-spacing w-layout-width">
			<Card className="transition-colors">
				<CardHeader className="p-4 pb-2">
					<CardTitle className="text-lg font-owl">Streak</CardTitle>
					<Separator />
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
						<StatCell label="Current" value={stats.currentStreak} icon={<Flame className="size-4 text-primary-foreground" />} />
						<StatCell label="Best" value={stats.highestStreak} icon={<Trophy className="size-4 text-yellow-500" />} />
					</div>
				</CardContent>
			</Card>
			{dataset === 'owcs-s3' && <FilterCard dataset={dataset} />}
		</div>
	);
}

function StatCell({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<div className="flex items-center gap-1.5 mb-0.5">
				{icon}
				<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			</div>
			<span className="text-muted-foreground tracking-wide">{label}</span>
		</div>
	);
}

function FilterCard({ dataset }: { dataset: Dataset }) {
	const filtersFromStore = useEndlessStore((s) => s.datasets[dataset]?.filters);
	const filters: EndlessFilters = filtersFromStore ?? DEFAULT_FILTERS;
	const updateFilters = useEndlessStore((s) => s.updateFilters);

	const isRegionActive = (region: OwcsS3Region) => filters.regions.length === 0 || filters.regions.includes(region);

	const toggleRegion = (region: OwcsS3Region) => {
		const allRegions = [...OWCS_S3_REGIONS];
		const current = filters.regions;
		let newRegions: string[];
		if (current.length === 0) {
			newRegions = allRegions.filter((r) => r !== region);
		} else if (current.includes(region)) {
			newRegions = current.filter((r) => r !== region);
			if (newRegions.length === 0) newRegions = [];
		} else {
			newRegions = [...current, region];
			if (newRegions.length === allRegions.length) newRegions = [];
		}
		updateFilters(dataset, { ...filters, regions: newRegions });
	};

	const togglePartner = () => {
		updateFilters(dataset, { ...filters, partnerOnly: !filters.partnerOnly });
	};

	return (
		<Card className="transition-colors mt-2">
			<CardHeader className="p-4 pb-2">
				<CardTitle className="text-lg font-owl">Filters</CardTitle>
				<Separator />
			</CardHeader>
			<CardContent className="p-4 pt-0 space-y-2.5">
				{OWCS_S3_REGIONS.map((region) => (
					<div key={region} className="flex items-center justify-between">
						<Label htmlFor={`filter-region-${region}`} className="text-sm cursor-pointer">
							{region}
						</Label>
						<Switch id={`filter-region-${region}`} checked={isRegionActive(region)} onCheckedChange={() => toggleRegion(region)} />
					</div>
				))}
				<Separator />
				<div className="flex items-center justify-between">
					<Label htmlFor="filter-partner" className="text-sm cursor-pointer">
						Partner teams only
					</Label>
					<Switch id="filter-partner" checked={filters.partnerOnly} onCheckedChange={togglePartner} />
				</div>
				<p className="text-xs text-muted-foreground pt-0.5">Changing filters resets your streak.</p>
			</CardContent>
		</Card>
	);
}
