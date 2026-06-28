'use client';

import { useEffect } from 'react';
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GuessDonut, type DonutSlice, rampStop, FAILED_COLOR } from '@/components/statistics/StatCharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useHistoryDetail } from '@/hooks/use-history-detail';
import type { HistoryEntry } from '@/types/history';
import type { GuessBucket } from '@/types/statistics';

function sliceColor(index: number, nonFailed: number, isFailed: boolean): string {
	if (isFailed) return FAILED_COLOR;
	return rampStop(nonFailed > 1 ? index / (nonFailed - 1) : 0);
}

function buildSlices(dist: GuessBucket[]): { slices: DonutSlice[]; activeIndex: number } {
	const total = dist.reduce((s, d) => s + d.count, 0);
	const nonFailed = dist.filter((d) => d.bucket !== 'failed').length;
	const slices: DonutSlice[] = dist.map((d) => {
		const isFailed = d.bucket === 'failed';
		return {
			bucket: d.bucket,
			label: isFailed ? 'Failed' : `${d.bucket} ${d.bucket === '1' ? 'guess' : 'guesses'}`,
			count: d.count,
			pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
			fill: sliceColor(isFailed ? 0 : Number(d.bucket) - 1, nonFailed, isFailed),
		};
	});
	const activeIndex = slices.reduce((best, s, i, arr) => (s.count > arr[best].count ? i : best), 0);
	return { slices, activeIndex };
}

// First slice color.
const WIN_COLOR = rampStop(0);

const winRateConfig: ChartConfig = {
	win: { label: 'Win Rate', color: WIN_COLOR },
};

function WinRateChart({ winRate }: { winRate: number }) {
	// Helper so the arc only fills up to <win-percentage>% full
	const winEndAngle = 180 - (winRate / 100) * 180;

	const sharedProps = {
		innerRadius: 65,
		outerRadius: 85,
		margin: { top: 0, right: 0, bottom: -100, left: 0 },
	} as const;

	return (
		<div className="relative mx-auto mt-2 h-44 -mb-16 w-full">
			{/* Static gray background,always full 180°, renders immediately */}
			<div className="pointer-events-none absolute inset-0">
				<ChartContainer config={winRateConfig} className="h-full w-full">
					<RadialBarChart {...sharedProps} data={[{ bg: 1 }]} startAngle={180} endAngle={0}>
						<RadialBar dataKey="bg" fill="var(--secondary)" cornerRadius={5} isAnimationActive={false} className="stroke-transparent stroke-2" />
					</RadialBarChart>
				</ChartContainer>
			</div>

			{/* Animated win arc, endAngle controls exact fill proportion */}
			<div className="absolute inset-0">
				<ChartContainer config={winRateConfig} className="h-full w-full">
					<RadialBarChart {...sharedProps} data={[{ win: 1 }]} startAngle={180} endAngle={winEndAngle}>
						<RadialBar
							dataKey="win"
							fill={sliceColor(1, 7, false)}
							cornerRadius={5}
							animationBegin={400}
							animationDuration={1500}
							className="stroke-transparent stroke-2"
						/>
						<ChartTooltip
							cursor={false}
							content={({ active, payload }) => {
								if (!active || !payload?.length) return null;
								return (
									<div className="rounded-lg border bg-background px-3 py-1.5 text-sm shadow-sm">
										<div className="flex items-center gap-2">
											<div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: WIN_COLOR }} />
											<span className="text-muted-foreground">Win Rate</span>
											<span className="ml-2 font-mono font-medium">{winRate}%</span>
										</div>
									</div>
								);
							}}
						/>
						<PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
							<Label
								content={({ viewBox }) => {
									if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
									const cx = viewBox.cx ?? 0;
									const cy = viewBox.cy ?? 0;
									return (
										<text x={cx} y={cy} textAnchor="middle">
											<tspan x={cx} y={cy - 12} className="fill-foreground text-2xl font-owl">
												{winRate}%
											</tspan>
											<tspan x={cx} y={cy + 6} className="fill-muted-foreground text-xs">
												win rate
											</tspan>
										</text>
									);
								}}
							/>
						</PolarRadiusAxis>
					</RadialBarChart>
				</ChartContainer>
			</div>
		</div>
	);
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

interface Props {
	dataset: string;
	iteration: number | null;
	entry: HistoryEntry | null;
	prevIteration: number | null;
	nextIteration: number | null;
	onClose: () => void;
	onNavigate: (it: number) => void;
}

export default function HistoryDetailDialog({ dataset, iteration, entry, prevIteration, nextIteration, onClose, onNavigate }: Props) {
	const { data, isLoading, isError, isPlaceholderData } = useHistoryDetail(dataset, iteration);
	const open = iteration != null;

	// Fall back to list entry data for immediate header display before detail resolves.
	const displayPlayer = data?.player ?? entry?.player;
	const displayDate = data?.date ?? entry?.date;
	const displayIteration = data?.iteration ?? entry?.iteration ?? iteration;

	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' && nextIteration != null) onNavigate(nextIteration);
			if (e.key === 'ArrowRight' && prevIteration != null) onNavigate(prevIteration);
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [open, prevIteration, nextIteration, onNavigate]);

	const isInitialLoading = isLoading && !data;

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="max-w-lg overflow-hidden">
				<DialogHeader className="text-left">
					<DialogTitle className="font-owl">History</DialogTitle>
					{displayDate != null ? (
						<p className="text-sm text-muted-foreground">
							{formatDate(displayDate)}
							{displayIteration != null ? ` · #${displayIteration}` : ''}
						</p>
					) : iteration != null ? (
						<Skeleton className="h-4 w-48" />
					) : null}
				</DialogHeader>

				{/* Answer card (shows immediately from list entry, games count fills in after detail loads) */}
				{displayPlayer != null ? (
					<div className="flex items-center justify-between rounded-md bg-secondary/40 px-4 py-3">
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Answer</p>
							<p className="font-semibold font-owl text-primary-foreground text-2xl">{displayPlayer}</p>
						</div>
						<div className="text-right">
							<p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Games played</p>
							{data ? <p className="font-semibold font-owl text-2xl">{data.summary.gamesPlayed.toLocaleString()}</p> : <Skeleton className="h-8 rounded-md" />}
						</div>
					</div>
				) : (
					<Skeleton className="h-14 rounded-md" />
				)}

				{isError && <p className="py-8 text-center text-muted-foreground">Couldn't load this puzzle.</p>}

				{isInitialLoading && !isError && (
					<div className="flex flex-col items-center gap-4">
						<Skeleton className="h-64 w-full rounded-lg" />
						<Skeleton className="h-40 w-full rounded-lg" />
					</div>
				)}

				{data && (
					<div
						className={cn(
							'flex w-full min-w-0 flex-col items-center gap-2 transition-opacity duration-300',
							isPlaceholderData && 'pointer-events-none opacity-50'
						)}>
						{data.summary.gamesPlayed === 0 ? (
							<p className="w-full py-8 text-center font-owl text-muted-foreground">No games were played on this day.</p>
						) : (
							<>
								{(() => {
									const { slices, activeIndex } = buildSlices(data.guessDistribution);
									return (
										<GuessDonut
											key={`donut-${data.iteration}`}
											slices={slices}
											center={{
												value: data.summary.averageGuesses?.toFixed(1) ?? '—',
												label: 'avg guesses',
											}}
											activeIndex={activeIndex}
											className="h-64 w-full"
										/>
									);
								})()}
								<WinRateChart key={`winrate-${data.iteration}`} winRate={data.summary.winRate} />
							</>
						)}
					</div>
				)}

				<div className="relative z-10 flex justify-end gap-2 pt-1">
					<Button
						variant="outline"
						size="icon"
						disabled={nextIteration == null || isPlaceholderData}
						onClick={() => nextIteration != null && onNavigate(nextIteration)}
						aria-label="Newer iteration">
						<ChevronLeft className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						disabled={prevIteration == null || isPlaceholderData}
						onClick={() => prevIteration != null && onNavigate(prevIteration)}
						aria-label="Older iteration">
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
