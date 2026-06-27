'use client';

import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { Bar, BarChart } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalGames } from '@/hooks/use-global-games';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePerDay } from '@/hooks/use-per-day';
import type { Dataset } from '@/data/datasets';

const BAR_COLOR = 'var(--primary-foreground)';
const dayLabel = (date: string) => new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Classic count-up ticker: tweens from its current value to the new one whenever
 *  `value` changes (and counts up from 0 on first mount). */
function AnimatedCount({ value }: { value: number }) {
	const count = useMotionValue(0);
	const text = useTransform(count, (v) => Math.round(v).toLocaleString());

	useEffect(() => {
		const controls = animate(count, value, { duration: 1, ease: 'easeOut' });
		return () => controls.stop();
	}, [value, count]);

	return <motion.span>{text}</motion.span>;
}

function BarsTooltip({ active, payload }: { active?: boolean; payload?: { value?: number | null; payload?: { date?: string } }[] }) {
	if (!active || !payload?.length) return null;
	const value = payload[0]?.value;
	const date = payload[0]?.payload?.date;
	return (
		<div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<span className="text-muted-foreground">{date ? dayLabel(date) : ''}: </span>
			<span className="font-mono font-medium tabular-nums text-foreground">{value == null ? '—' : Number(value).toLocaleString()}</span>
			<span className="text-muted-foreground"> games</span>
		</div>
	);
}

/** Subtle background histogram: games played per day across every dataset over the last 90 days. */
function GlobalGamesBars({ dataset }: { dataset: Dataset }) {
	const { data } = usePerDay({ dataset, range: 'last90', from: null, to: null, scope: 'all' });
	const points = data?.perDay ?? [];
	if (points.length === 0) return null;
	const chartData = points.map((p) => ({ date: p.date, played: p.played }));

	return (
		<ChartContainer config={{ played: { label: 'Games', color: BAR_COLOR } }} className="h-16 w-full aspect-auto **:outline-none!">
			<BarChart accessibilityLayer data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap={1}>
				<ChartTooltip cursor={{ fill: 'var(--primary-foreground)', fillOpacity: 0.08 }} content={<BarsTooltip />} />
				<Bar dataKey="played" fill={BAR_COLOR} fillOpacity={1} radius={1} />
			</BarChart>
		</ChartContainer>
	);
}

export function GlobalGamesCard({ dataset }: { dataset: Dataset }) {
	const { data, isError } = useGlobalGames();
	const isMobile = useIsMobile();

	return (
		<Card className="overflow-hidden border-primary-foreground/30 bg-primary-foreground/3">
			<CardContent className="flex items-center gap-6 p-5">
				<div className="flex shrink-0 flex-col">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Total Daily Games Played</p>
					{data == null ? (
						isError ? (
							<p className="text-4xl font-owl text-primary-foreground">—</p>
						) : (
							<Skeleton className="h-10 w-40" />
						)
					) : (
						<p className="text-4xl font-owl text-primary-foreground tabular-nums">
							<AnimatedCount value={data} />
						</p>
					)}
					<p className="mt-1 text-sm text-muted-foreground">All-time, across every season &amp; mode</p>
				</div>
				{!isMobile && (
					<div className="flex flex-1 items-end self-stretch">
						<GlobalGamesBars dataset={dataset} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
