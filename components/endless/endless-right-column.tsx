'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dataset } from '@/data/datasets';
import type { EndlessFilters } from '@/store/endless-store';
import { useEndlessStore } from '@/store/endless-store';
import { ENDLESS_BACKEND_DISABLED } from '@/hooks/use-endless-game';
import { pickStreamerName } from '@/lib/streamer-names';
import { Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type EndlessStats = {
	wins: number;
	games: number;
};

type LeaderboardEntry = {
	name?: string;
	streakLength: number;
	clientId: string;
	anonymous?: boolean;
};

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5'] as const;
const OWCS_S3_REGION_BITS: Record<string, number> = { EMEA: 1, NA: 2, Korea: 4, CN: 8 };
const ALL_OWCS_S3_REGIONS = Object.keys(OWCS_S3_REGION_BITS);

function encodeFiltersForQuery(filters: EndlessFilters): string {
	const regions = filters.regions ?? [];
	if (regions.length === 0 && !filters.topTeamsOnly) return '';
	const activeRegions = regions.length === 0 ? ALL_OWCS_S3_REGIONS : regions;
	const region = activeRegions.reduce((acc, r) => acc | (OWCS_S3_REGION_BITS[r] ?? 0), 0);
	return `&region=${region}&partnerOnly=${filters.topTeamsOnly}`;
}

type Props = {
	stats: EndlessStats;
	dataset: Dataset;
	filters: EndlessFilters;
	onOpenLeaderboard: () => void;
};

export default function EndlessRightColumn({ stats, dataset, filters, onOpenLeaderboard }: Props) {
	const clientId = useEndlessStore((s) => s.leaderboard.clientId);
	const filterKey = dataset !== 'owcs-s3' ? 'none' : `${(filters.regions ?? []).join(',')}-${filters.topTeamsOnly}`;

	const { data } = useQuery<{ entries: LeaderboardEntry[] }>({
		queryKey: ['leaderboard-top5', dataset, filterKey],
		queryFn: async () => {
			const filterQuery = dataset === 'owcs-s3' ? encodeFiltersForQuery(filters) : '';
			const res = await fetch(`/api/endless/leaderboard?dataset=${dataset}&page=1&limit=5${filterQuery}`);
			if (!res.ok) throw new Error('Failed to fetch leaderboard');
			return res.json();
		},
		staleTime: 30_000,
		gcTime: 0,
		enabled: !ENDLESS_BACKEND_DISABLED,
	});

	const top5 = data?.entries?.slice(0, 5) ?? [];
	const isLoading = data === undefined;

	return (
		<div className="hidden xl:block absolute left-full ml-layout-spacing top-endless-top w-layout-width space-y-3">
			<Card className="transition-colors">
				<Accordion type="single" collapsible defaultValue="games">
					<AccordionItem value="games" className="border-b-0">
						<CardHeader className="p-4">
							<AccordionTrigger className="py-0 cursor-pointer hover:no-underline">
								<span className="text-lg font-owl font-semibold leading-none tracking-tight">Games</span>
							</AccordionTrigger>
						</CardHeader>
						<AccordionContent className="p-0">
							<CardContent className="p-4 pt-0 space-y-3">
								<div className="flex flex-row justify-around text-sm">
									<StatCell label="Played" value={stats.games} />
									<StatCell label="Wins" value={stats.wins} />
								</div>
							</CardContent>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Card>
			<Card className="transition-colors">
				<Accordion type="single" collapsible defaultValue="top5">
					<AccordionItem value="top5" className="border-b-0">
						<CardHeader className="p-4">
							<AccordionTrigger className="py-0 cursor-pointer hover:no-underline">
								<span className="text-lg font-owl font-semibold leading-none tracking-tight">Top 5</span>
							</AccordionTrigger>
						</CardHeader>
						<AccordionContent className="p-0">
							<CardContent className="p-4 pt-0 space-y-1">
								{ENDLESS_BACKEND_DISABLED ? (
									<p className="text-xs text-muted-foreground text-center">Leaderboard temporarily unavailable</p>
								) : isLoading ? (
									SKELETON_KEYS.map((key) => (
										<div key={key} className="grid grid-cols-[1.25rem_1fr_2.5rem] gap-2 items-center h-5">
											<Skeleton className="h-4 w-4 rounded" />
											<Skeleton className="h-4 rounded" />
											<Skeleton className="h-4 w-8 rounded ml-auto" />
										</div>
									))
								) : top5.length === 0 ? (
									<p className="text-xs text-muted-foreground text-center mb-4">No entries yet</p>
								) : (
									top5.map((entry, i) => {
										const isOwn = entry.clientId === clientId;
										return (
											<div key={entry.clientId ?? `pos-${i}`} className={`grid grid-cols-[1.25rem_1fr_2.5rem] gap-2 items-center text-sm ${isOwn ? 'font-semibold' : ''}`}>
												<span className="text-muted-foreground tabular-nums text-xs text-center">
													{i <= 2 ? ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'][i] : i + 1}
												</span>
												<span className={`truncate ${entry.anonymous ? 'text-muted-foreground italic' : ''}`}>{entry.name ?? pickStreamerName(entry.clientId)}</span>
												<span className="text-right tabular-nums font-mono text-xs">{entry.streakLength}</span>
											</div>
										);
									})
								)}
								{!ENDLESS_BACKEND_DISABLED && (
									<>
										<Separator className="mt-2!" />
										<Button variant="outline" className="w-full gap-2 mt-2!" onClick={onOpenLeaderboard}>
											<Trophy className="size-4 text-yellow-500" />
											Leaderboard
										</Button>
									</>
								)}
							</CardContent>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Card>
		</div>
	);
}

function StatCell({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<div className="flex items-center gap-1.5 mb-0.5">
				<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			</div>
			<span className="text-muted-foreground tracking-wide">{label}</span>
		</div>
	);
}
