'use client';

import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartCard, type DonutSlice, GuessDonut, rampStop } from '@/components/statistics/StatCharts';
import { useChartDialog } from '@/hooks/use-chart-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOverview } from '@/hooks/use-overview';
import type { OverviewMode, OverviewResponse } from '@/types/statistics';
import { Marker, MarkerContent } from '@/components/ui/marker';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { STATISTICS_GLOBAL_PATHNAME } from '@/data/datasets';
import { ArrowRight } from 'lucide-react';

const ACCENT = 'var(--primary-foreground)';
const MODE_LABELS: Record<OverviewMode, string> = { owl: 'Overwatch League', owcs: 'Champion Series' };
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // index = weekday-1
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0..23

const HEATMAP_SQUARE_CELLS = true;

const hourLabel = (h: number) => `${h}:00`;
const num = (n: number) => n.toLocaleString();

/** A compact, unique dataset label: "OWL S6" / "OWCS S3" (shorthands repeat across modes). */
function datasetLabel(d: OverviewResponse['byDataset'][number]): string {
	return `${d.mode === 'owl' ? 'OWL' : 'OWCS'} ${d.shorthand}`;
}

/** Tooltip container + row, matching the dashboard's tooltip styling. */
function TooltipBox({ children }: { children: React.ReactNode }) {
	return <div className="grid min-w-44 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">{children}</div>;
}
function Row({ label, value, color }: { label: string; value: string; color?: string }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="flex items-center gap-1.5 text-muted-foreground">
				{color && <span className="h-2.5 w-1 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />}
				{label}
			</span>
			<span className="font-mono font-medium tabular-nums text-foreground">{value}</span>
		</div>
	);
}

function DatasetDonutCard({ data, total }: { data: OverviewResponse['byDataset']; total: number }) {
	const { open, setOpen } = useChartDialog('ovModes');
	const center = { value: total.toLocaleString(), label: 'games played' };
	const slices: DonutSlice[] = data.map((d, i, arr) => ({
		bucket: d.dataset,
		label: datasetLabel(d),
		count: d.played,
		pct: total > 0 ? Math.round((d.played / total) * 100) : 0,
		fill: rampStop(arr.length > 1 ? i / (arr.length - 1) : 0),
	}));
	const activeIndex = 0; // already played-desc

	return (
		<ChartCard title="Games by Mode" open={open} setOpen={setOpen}>
			<div className="flex flex-1 flex-col">
				{/* <p className="-mt-1 mb-1 text-xs text-muted-foreground">Every game ever played, split by season &amp; mode</p> */}
				<div className="flex min-h-72 flex-1 items-center justify-center">
					<GuessDonut slices={slices} center={center} activeIndex={activeIndex} className="aspect-auto size-full max-w-2xl" />
				</div>
			</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-2xl" aria-describedby="Games by Mode chart">
					<DialogHeader>
						<DialogTitle className="font-owl">Games by Mode</DialogTitle>
					</DialogHeader>
					{/* <p className="text-sm text-muted-foreground">Every game ever played, split by season &amp; mode</p> */}
					<GuessDonut slices={slices} center={center} activeIndex={activeIndex} className="aspect-square w-full max-w-115" />
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

function GamesByWeekdayCard({ data }: { data: OverviewResponse['byWeekday'] }) {
	const { open, setOpen } = useChartDialog('ovWeekday');
	const isMobile = useIsMobile();
	const total = data.reduce((s, d) => s + d.played, 0);
	const avgPct = 100 / 7;
	const chartData = data.map((d) => ({
		...d,
		label: WEEKDAY_LABELS[d.weekday - 1],
		pct: total > 0 ? Math.round((d.played / total) * 1000) / 10 : 0,
	}));
	const domainMin = Math.max(0, Math.floor(Math.min(...chartData.map((d) => d.pct))) - 1);
	const body = (className: string) => (
		<ChartContainer config={{ pct: { label: '%', color: ACCENT } }} className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<BarChart accessibilityLayer={!isMobile} data={chartData} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 4 }}>
				<CartesianGrid horizontal={false} />
				<XAxis
					type="number"
					domain={[domainMin, (dataMax: number) => Math.ceil(dataMax) + 1]}
					tickLine={false}
					axisLine={false}
					tickFormatter={(v) => `${v}%`}
				/>
				<YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={36} />
				<ReferenceLine
					x={avgPct}
					stroke="var(--muted-foreground)"
					strokeDasharray="2 4"
					strokeOpacity={0.5}
					label={{ value: 'avg', position: 'top', fill: 'var(--muted-foreground)', fontSize: 10 }}
				/>
				<ChartTooltip
					cursor={{ fill: ACCENT, fillOpacity: 0.08 }}
					content={({ active, payload }) => {
						if (!active || !payload?.length) return null;
						const p = payload[0]?.payload as { weekday: number; played: number; owl: number; owcs: number; pct: number };
						return (
							<TooltipBox>
								<div className="font-medium">{WEEKDAY_LABELS[p.weekday - 1]}</div>
								{p.owl > 0 && <Row label={MODE_LABELS.owl} value={num(p.owl)} />}
								{p.owcs > 0 && <Row label={MODE_LABELS.owcs} value={num(p.owcs)} />}
								<div className="my-0.5 h-px bg-border/60" />
								<Row label="Total" value={`${num(p.played)} (${p.pct}%)`} />
							</TooltipBox>
						);
					}}
				/>
				<Bar dataKey="pct" radius={4} fill={ACCENT}>
					<LabelList dataKey="pct" position="right" formatter={(v: unknown) => `${v}%`} fontSize={10} className="fill-muted-foreground" />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
	return (
		<ChartCard title="Games by Day of Week" open={open} setOpen={setOpen}>
			<div className="flex flex-1 flex-col">
				<div className="flex min-h-64 flex-1">{body('w-full')}</div>
			</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-3xl" aria-describedby="Games by day of week">
					<DialogHeader>
						<DialogTitle className="font-owl">Games by Day of Week</DialogTitle>
					</DialogHeader>
					{body('h-[60vh] w-full')}
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

function GamesByHourCard({ data }: { data: OverviewResponse['byHour'] }) {
	const { open, setOpen } = useChartDialog('ovHour');
	const isMobile = useIsMobile();
	const total = data.reduce((s, d) => s + d.played, 0);
	const avgPct = 100 / 24;
	const chartData = data.map((d) => ({
		...d,
		pct: total > 0 ? Math.round((d.played / total) * 1000) / 10 : 0,
	}));
	const body = (className: string, gradId: string) => (
		<ChartContainer config={{ pct: { label: '%', color: ACCENT } }} className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<AreaChart accessibilityLayer={!isMobile} data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
						<stop offset="95%" stopColor={ACCENT} stopOpacity={0.02} />
					</linearGradient>
				</defs>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={hourLabel} minTickGap={24} />
				<YAxis tickLine={false} axisLine={false} width={36} tickFormatter={(v) => `${v}%`} />
				<ReferenceLine y={avgPct} stroke="var(--muted-foreground)" strokeDasharray="2 4" strokeOpacity={0.5} />
				<ChartTooltip
					cursor={false}
					content={({ active, payload }) => {
						if (!active || !payload?.length) return null;
						const p = payload[0]?.payload as { hour: number; played: number; owl: number; owcs: number; pct: number };
						return (
							<TooltipBox>
								<div className="font-medium">{hourLabel(p.hour)}</div>
								{p.owl > 0 && <Row label={MODE_LABELS.owl} value={num(p.owl)} />}
								{p.owcs > 0 && <Row label={MODE_LABELS.owcs} value={num(p.owcs)} />}
								<div className="my-0.5 h-px bg-border/60" />
								<Row label="Total" value={`${num(p.played)} (${p.pct}%)`} />
							</TooltipBox>
						);
					}}
				/>
				<Area type="monotone" dataKey="pct" stroke={ACCENT} strokeWidth={2} fill={`url(#${gradId})`} dot={false} connectNulls />
			</AreaChart>
		</ChartContainer>
	);
	return (
		<ChartCard title="Games by Hour of Day" open={open} setOpen={setOpen}>
			<p className="-mt-1 mb-2 text-xs text-muted-foreground">All times in UTC</p>
			{body('h-64 w-full', 'ov-hour-fill')}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-3xl" aria-describedby="Games by hour of day">
					<DialogHeader>
						<DialogTitle className="font-owl">Games by Hour of Day</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">All times in UTC</p>
					{body('h-[60vh] w-full', 'ov-hour-fill-dialog')}
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Guessed-Player Roles
function RolesCard({ data }: { data: OverviewResponse['byRole'] }) {
	const { open, setOpen } = useChartDialog('ovRoles');
	const isMobile = useIsMobile();
	const firstColor = rampStop(0);
	const allColor = rampStop(4 / 6);
	const firstTotal = data.reduce((s, d) => s + d.first, 0);
	const allTotal = data.reduce((s, d) => s + d.all, 0);
	const chartData = data.map((d) => ({
		...d,
		firstPct: firstTotal > 0 ? Math.round((d.first / firstTotal) * 1000) / 10 : 0,
		allPct: allTotal > 0 ? Math.round((d.all / allTotal) * 1000) / 10 : 0,
	}));
	const body = (className: string) => (
		<ChartContainer
			config={{ firstPct: { label: 'First guess %', color: firstColor }, allPct: { label: 'All guesses %', color: allColor } }}
			className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<BarChart accessibilityLayer={!isMobile} data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="role" tickLine={false} axisLine={false} tickMargin={8} />
				<YAxis tickLine={false} axisLine={false} width={36} tickFormatter={(v) => `${v}%`} />
				<ChartTooltip
					cursor={{ fill: ACCENT, fillOpacity: 0.08 }}
					content={({ active, payload }) => {
						if (!active || !payload?.length) return null;
						const p = payload[0]?.payload as { role: string; first: number; firstPct: number; all: number; allPct: number };
						return (
							<TooltipBox>
								<div className="font-medium">{p.role}</div>
								<Row label="First guess" value={`${num(p.first)} (${p.firstPct}%)`} color={firstColor} />
								<Row label="All guesses" value={`${num(p.all)} (${p.allPct}%)`} color={allColor} />
							</TooltipBox>
						);
					}}
				/>
				<Bar dataKey="firstPct" radius={4} fill={firstColor} />
				<Bar dataKey="allPct" radius={4} fill={allColor} />
			</BarChart>
		</ChartContainer>
	);
	return (
		<ChartCard title="Player Roles" open={open} setOpen={setOpen}>
			<p className="-mt-1 mb-2 text-xs text-muted-foreground">How often each role is guessed first vs. across all guesses</p>
			<div className="mb-2 flex gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-3 rounded-[2px]" style={{ backgroundColor: firstColor }} />
					First guess
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-3 rounded-[2px]" style={{ backgroundColor: allColor }} />
					All guesses
				</span>
			</div>
			{body('h-56 w-full')}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-2xl" aria-describedby="Guessed-player roles">
					<DialogHeader>
						<DialogTitle className="font-owl">Guessed-Player Roles</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">How often each role is guessed first vs. across all guesses</p>
					{body('h-[50vh] w-full')}
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Performance by Dataset

function PerformanceByDatasetCard({ data }: { data: OverviewResponse['byDataset'] }) {
	const { open, setOpen } = useChartDialog('ovPerf');
	const isMobile = useIsMobile();
	const sorted = [...data].sort((a, b) => b.winRate - a.winRate).map((d) => ({ ...d, name: datasetLabel(d) }));
	const body = (className: string) => (
		<ChartContainer config={{ winRate: { label: 'Win rate', color: ACCENT } }} className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<BarChart accessibilityLayer={!isMobile} data={sorted} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 4 }}>
				<CartesianGrid horizontal={false} />
				<XAxis type="number" domain={[0, 100]} hide />
				<YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={64} fontSize={11} />
				<ChartTooltip
					cursor={{ fill: ACCENT, fillOpacity: 0.08 }}
					content={({ active, payload }) => {
						if (!active || !payload?.length) return null;
						const p = payload[0]?.payload as { name: string; winRate: number; avgGuesses: number | null; played: number };
						return (
							<TooltipBox>
								<div className="font-medium">{p.name}</div>
								<Row label="Win rate" value={`${p.winRate}%`} />
								<Row label="Avg guesses" value={p.avgGuesses != null ? String(p.avgGuesses) : '—'} />
								<Row label="Games played" value={num(p.played)} />
							</TooltipBox>
						);
					}}
				/>
				<Bar dataKey="winRate" radius={4} fill={ACCENT}>
					<LabelList dataKey="winRate" position="right" formatter={(v: unknown) => `${v}%`} fontSize={11} className="fill-muted-foreground" />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
	return (
		<ChartCard title="Performance by Mode" open={open} setOpen={setOpen}>
			<p className="-mt-1 mb-2 text-xs text-muted-foreground">Win rate by season &amp; mode</p>
			{body('h-64 w-full')}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-2xl" aria-describedby="Performance by dataset">
					<DialogHeader>
						<DialogTitle className="font-owl">Performance by Dataset</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">Win rate by season &amp; mode</p>
					{body('h-[60vh] w-full')}
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Activity Heatmap

function HeatRow({
	label,
	weekday,
	byKey,
	cellOpacity,
	cellClass,
	isMobile,
	onTap,
}: {
	label: string;
	weekday: number;
	byKey: Map<string, number>;
	cellOpacity: (v: number) => number;
	cellClass: string;
	isMobile: boolean;
	onTap: (info: string) => void;
}) {
	return (
		<>
			<div className="flex items-center pr-1.5 text-[0.65rem] text-muted-foreground">{label}</div>
			{HOURS.map((hour) => {
				const v = byKey.get(`${weekday}-${hour}`) ?? 0;
				const cell = (
					<div
						className={`${cellClass} rounded-[2px] cursor-default`}
						style={{ backgroundColor: ACCENT, opacity: cellOpacity(v) }}
						onClick={isMobile ? () => onTap(`${label} ${hour}:00 — ${num(v)} games`) : undefined}
						onKeyDown={
							isMobile
								? (e) => {
										if (e.key === 'Enter' || e.key === ' ') onTap(`${label} ${hour}:00 — ${num(v)} games`);
									}
								: undefined
						}
					/>
				);
				if (isMobile) return <div key={`${weekday}-${hour}`}>{cell}</div>;
				return (
					<Tooltip key={`${weekday}-${hour}`}>
						<TooltipTrigger asChild>{cell}</TooltipTrigger>
						<TooltipContent side="top" className="text-xs">
							<span className="font-medium">
								{label} {hour}:00
							</span>{' '}
							— {num(v)} games
						</TooltipContent>
					</Tooltip>
				);
			})}
		</>
	);
}

function ActivityHeatmapCard({ data }: { data: OverviewResponse['heatmap'] }) {
	const { open, setOpen } = useChartDialog('ovHeatmap');
	const isMobile = useIsMobile();
	const [tapInfo, setTapInfo] = useState<string | null>(null);
	const byKey = new Map(data.map((c) => [`${c.weekday}-${c.hour}`, c.played]));
	const max = Math.max(1, ...data.map((c) => c.played));
	const cellOpacity = (v: number) => (v <= 0 ? 0.04 : 0.12 + 0.88 * (v / max));
	// compact=true: card view, fixed 1rem columns so cells stay ~16px regardless of card width.
	// compact=false: dialog view, fluid 1fr columns that fill the bounded dialog width.
	const grid = (cell: string, compact: boolean) => (
		<TooltipProvider delayDuration={80}>
			<div className={compact ? 'mx-auto w-fit' : 'min-w-140'}>
				<div
					className="grid gap-0.75"
					style={{
						gridTemplateColumns: compact ? `2.5rem repeat(24, ${isMobile ? '1.2rem' : '2.25rem'})` : `2.5rem repeat(24, minmax(0, 1fr))`,
					}}>
					<div />
					{HOURS.map((hour) => (
						<div key={`hdr-${hour}`} className="min-w-0 text-center text-[0.6rem] text-muted-foreground tabular-nums">
							{isMobile ? hour : `${hour}:00`}
						</div>
					))}
					{WEEKDAY_LABELS.map((label, wi) => (
						<HeatRow
							key={label}
							label={label}
							weekday={wi + 1}
							byKey={byKey}
							cellOpacity={cellOpacity}
							cellClass={cell}
							isMobile={isMobile}
							onTap={setTapInfo}
						/>
					))}
				</div>
				{isMobile && tapInfo && <p className="mt-1.5 text-center text-xs text-muted-foreground">{tapInfo}</p>}
			</div>
		</TooltipProvider>
	);
	return (
		<ChartCard title="Activity Heatmap" open={open} setOpen={setOpen}>
			<p className="-mt-1 mb-2 text-xs text-muted-foreground">Games by weekday &amp; hour (UTC), darker = busier</p>
			<div className="overflow-x-auto">{grid(HEATMAP_SQUARE_CELLS ? 'aspect-square w-full' : 'h-5', true)}</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-4xl" aria-describedby="Activity heatmap">
					<DialogHeader>
						<DialogTitle className="font-owl">Activity Heatmap</DialogTitle>
					</DialogHeader>
					<div className="overflow-x-auto">{grid(HEATMAP_SQUARE_CELLS ? 'aspect-square w-full' : 'h-7', false)}</div>
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Section wrapper
function OverviewSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-92 rounded-lg" />
				<Skeleton className="h-92 rounded-lg" />
			</div>
			<Skeleton className="h-90 rounded-lg" />
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-90 rounded-lg" />
				<Skeleton className="h-90 rounded-lg" />
			</div>
			<Skeleton className="h-96 rounded-lg" />
		</div>
	);
}

function GlobalInsightsHeader() {
	return (
		<div className="sm:my-6 my-3">
			<Marker variant="separator">
				<MarkerContent>
					<h2 className="sm:text-3xl text-2xl font-owl text-primary-foreground">Global Metrics</h2>
				</MarkerContent>
			</Marker>
			<p className="text-sm text-muted-foreground w-full justify-self-center text-center">Every game ever played, across every season &amp; mode</p>
		</div>
	);
}

export function OverviewSection() {
	const { data, isLoading, isError } = useOverview();
	return (
		<section className="flex flex-col gap-4">
			<GlobalInsightsHeader />
			{isLoading && !data && <OverviewSkeleton />}
			{isError && !data && <p className="text-muted-foreground">Couldn't load the overview right now.</p>}
			{data && data.totalGames > 0 && (
				<>
					<div className="grid gap-4 sm:grid-cols-2">
						<DatasetDonutCard data={data.byDataset} total={data.totalGames} />
						<GamesByWeekdayCard data={data.byWeekday} />
					</div>
					<GamesByHourCard data={data.byHour} />
					<div className="grid gap-4 sm:grid-cols-2">
						<RolesCard data={data.byRole} />
						<PerformanceByDatasetCard data={data.byDataset} />
					</div>
					<ActivityHeatmapCard data={data.heatmap} />
				</>
			)}
		</section>
	);
}

/** Compact Global Metrics preview for the per-season /statistics page */
export function GlobalInsightsTeaser() {
	const { data, isLoading, isError } = useOverview();
	return (
		<section className="flex flex-col gap-4">
			<GlobalInsightsHeader />
			{isLoading && !data && (
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-92 rounded-lg" />
					<Skeleton className="h-92 rounded-lg" />
				</div>
			)}
			{isError && !data && <p className="text-muted-foreground">Couldn't load the overview right now.</p>}
			{data && data.totalGames > 0 && (
				<>
					<div className="grid gap-4 sm:grid-cols-2">
						<DatasetDonutCard data={data.byDataset} total={data.totalGames} />
						<RolesCard data={data.byRole} />
					</div>
					<div className="flex justify-center pt-1">
						<Button
							asChild
							size="lg"
							variant="outline"
							className="font-owl border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground/70">
							<Link href={STATISTICS_GLOBAL_PATHNAME}>
								Show more
								<ArrowRight className="p-0.75" />
							</Link>
						</Button>
					</div>
				</>
			)}
		</section>
	);
}
