'use client';

import { Maximize2, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, LabelList, Pie, PieChart, ReferenceLine, Sector, XAxis, YAxis } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { type ChartKey, useChartDialog } from '@/hooks/use-chart-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import type { DayPoint, GuessBucket, HardPuzzle, NamedCount, TeamCount } from '@/types/statistics';

// Summary Cards

type SummaryData = {
	gamesPlayed: number;
	wins: number;
	losses: number;
	winRate: number;
	averageGuesses: number | null;
	solvedFirstGuessRate: number;
};

export function SummaryCards({ summary }: { summary: SummaryData }) {
	const stats: { label: string; value: string | number }[] = [
		{ label: 'Games Played', value: summary.gamesPlayed.toLocaleString() },
		{ label: 'Win Rate', value: `${summary.winRate}%` },
		{ label: 'Avg Guesses', value: summary.averageGuesses?.toFixed(1) ?? '—' },
		{ label: '1st Guess Wins', value: `${summary.solvedFirstGuessRate}%` },
		{ label: 'Total Wins', value: summary.wins.toLocaleString() },
	];

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardContent className="p-5">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{stat.label}</p>
						<p className="text-3xl font-owl text-primary-foreground">{stat.value}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Shared chart card wrapper

/** Card shell with a title, separator, and an expand-to-fullscreen button.
 *  Hotkeys: "f" while hovering the card opens its dialog; "f" again closes it for non-search
 *  dialogs (search dialogs close via Esc or Alt+F). Hover is read from CSS `:hover` at keypress
 *  time (not a tracked flag) so an occluding overlay can never leave a card stuck "hovered". */
function ChartCard({
	title,
	open,
	setOpen,
	searchable = false,
	children,
}: {
	title: string;
	open: boolean;
	setOpen: (value: boolean) => void;
	searchable?: boolean;
	children: ReactNode;
}) {
	const cardRef = useRef<HTMLDivElement>(null);
	const openRef = useRef(open);
	openRef.current = open;
	const setOpenRef = useRef(setOpen);
	setOpenRef.current = setOpen;

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'f' || e.metaKey || e.ctrlKey || e.altKey) return;
			const target = e.target as HTMLElement | null;
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
			if (openRef.current) {
				if (!searchable) {
					e.preventDefault();
					setOpenRef.current(false);
				}
				return;
			}
			if (cardRef.current?.matches(':hover')) {
				e.preventDefault();
				setOpenRef.current(true);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [searchable]);

	return (
		<Card ref={cardRef} className="flex flex-col overflow-hidden">
			<CardHeader className="p-4 pb-2">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-lg font-owl">{title}</CardTitle>
					<Button
						variant="ghost"
						size="icon"
						className="size-7 -mr-1 text-muted-foreground hover:text-foreground"
						onClick={() => setOpen(true)}
						aria-label={`Expand ${title}`}>
						<Maximize2 className="size-4" />
					</Button>
				</div>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-1 flex-col p-4 pt-2">{children}</CardContent>
		</Card>
	);
}

// Reusable ranked horizontal bar chart

type BarDatum = { label: string; value: number; tip: string; rank: number };
type BarVariant = 'name-inside' | 'value-inside';

// Approx px width of one character at text-xs in the UI font — used to truncate labels to fit.
const CHAR_PX = 6.6;

/** Orange ramp stop (t: 0 = vivid accent → 1 = soft), shared by the donut slices and the top-3
 *  bar fills so both charts use the same palette. */
function rampStop(t: number): string {
	const light = Math.round(50 + t * 16); // 50% → 66%
	const sat = Math.round(88 - t * 22); // 88% → 66%
	return `hsl(21 ${sat}% ${light}%)`;
}
/** Top-3 bars reuse the donut palette (1st/3rd/5th ramp stops) for more contrast; rest neutral. */
function barFill(rank: number): string {
	if (rank === 1) return rampStop(0);
	if (rank === 2) return rampStop(2 / 6);
	if (rank === 3) return rampStop(4 / 6);
	return 'var(--secondary)';
}
/** White reads on the colored top-3 bars; the neutral bars need the contrasting foreground. */
const insideTextClass = (rank: number) => (rank <= 3 ? 'fill-white' : 'fill-secondary-foreground');

function HorizontalBarChart({
	data,
	config,
	labelWidth,
	domain,
	valueFormatter,
	variant = 'name-inside',
}: {
	data: BarDatum[];
	config: ChartConfig;
	labelWidth: number;
	domain?: [number, number];
	valueFormatter?: (v: number) => string;
	/** 'name-inside': name inside the bar, value on the right (counts).
	 *  'value-inside': value inside the bar, name on the right (used when the value is short, e.g. a %). */
	variant?: BarVariant;
}) {
	const isMobile = useIsMobile();
	const height = data.length * 40 + 16;
	const valueInside = variant === 'value-inside';
	const rightMargin = valueInside ? 120 : 92;

	const fmtValue = (v: number) => (valueFormatter ? valueFormatter(v) : String(v));

	const truncate = (raw: string, px: number) => {
		const maxChars = Math.floor(px / CHAR_PX);
		if (maxChars < 2) return null;
		return raw.length > maxChars ? `${raw.slice(0, Math.max(1, maxChars - 1))}…` : raw;
	};
	// Does the full (untruncated) name fit inside a bar this wide?
	const nameFitsInside = (raw: string, width: number) => width > 28 && Math.floor((width - 14) / CHAR_PX) >= raw.length;

	// Per-bar layout: 'value-inside' always shows the name on the right; 'name-inside' keeps the
	// name inside while it fits and otherwise flips to value-inside/name-right (so long names in the
	// short lower bars aren't truncated to the point of being unreadable).
	const showNameOutside = (d: BarDatum, width: number) => valueInside || !nameFitsInside(d.label, width);

	// y-axis tick: rank (#1…), top 3 in the accent color.
	const RankTick = ({ x, y, payload }: { x?: number | string; y?: number | string; payload?: { index?: number } }) => {
		const d = data[payload?.index ?? -1];
		if (!d) return null;
		const accent = d.rank <= 3;
		return (
			<text
				x={Number(x)}
				y={Number(y)}
				dy={4}
				textAnchor="end"
				fontSize={12}
				fontWeight={accent ? 600 : 400}
				className={accent ? 'fill-primary-foreground' : 'fill-muted-foreground'}>
				{`#${d.rank}`}
			</text>
		);
	};

	// Inside the bar: the name when it fits, otherwise the (short) value.
	const InsideLabel = (props: { x?: number | string; y?: number | string; width?: number | string; height?: number | string; index?: number }) => {
		const x = Number(props.x ?? 0);
		const y = Number(props.y ?? 0);
		const width = Number(props.width ?? 0);
		const h = Number(props.height ?? 0);
		const d = data[props.index ?? -1];
		if (!d) return null;
		const raw = showNameOutside(d, width) ? fmtValue(d.value) : d.label;
		const text = truncate(raw, width - 14);
		if (!text) return null;
		return (
			<text x={x + 8} y={y + h / 2} dominantBaseline="central" textAnchor="start" fontSize={12} className={`${insideTextClass(d.rank)} font-medium`}>
				{text}
			</text>
		);
	};

	// To the right of the bar: the value when the name is inside, otherwise the full name (top-3 accented).
	const RightLabel = (props: { x?: number | string; y?: number | string; width?: number | string; height?: number | string; index?: number }) => {
		const x = Number(props.x ?? 0);
		const y = Number(props.y ?? 0);
		const width = Number(props.width ?? 0);
		const h = Number(props.height ?? 0);
		const d = data[props.index ?? -1];
		if (!d) return null;
		const nameOutside = showNameOutside(d, width);
		const raw = nameOutside ? d.label : fmtValue(d.value);
		const text = truncate(raw, rightMargin - 12) ?? raw;
		const accent = nameOutside && d.rank <= 3;
		return (
			<text
				x={x + width + 8}
				y={y + h / 2}
				dominantBaseline="central"
				textAnchor="start"
				fontSize={12}
				className={`${accent ? 'fill-primary-foreground' : 'fill-foreground'} font-medium`}>
				{text}
			</text>
		);
	};

	return (
		<ChartContainer config={config} style={{ height }} className={`w-full aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<BarChart accessibilityLayer={!isMobile} data={data} layout="vertical" margin={{ right: rightMargin, left: 4 }}>
				<CartesianGrid horizontal={false} />
				<YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={8} width={labelWidth} interval={0} tick={RankTick} />
				<XAxis type="number" domain={domain} hide />
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent indicator="line" hideLabel formatter={(_v, _n, item) => (item?.payload as BarDatum)?.tip ?? ''} />}
				/>
				<Bar dataKey="value" radius={4} minPointSize={30}>
					{data.map((d) => (
						<Cell key={`${d.rank}-${d.label}`} fill={barFill(d.rank)} />
					))}
					<LabelList dataKey="value" content={InsideLabel} />
					<LabelList dataKey="value" content={RightLabel} />
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}

/**
 * A chart card backed by a ranked bar list. Shows the first `previewCount` bars and an
 * expand button opening a fullscreen dialog with the full (scrollable) list, plus optional
 * client-side search when `searchPlaceholder` is provided.
 */
function BarChartCard({
	title,
	chartKey,
	data,
	config,
	labelWidth,
	dialogLabelWidth,
	previewCount = 8,
	domain,
	valueFormatter,
	searchPlaceholder,
	variant = 'name-inside',
}: {
	title: string;
	chartKey: Exclude<ChartKey, 'none'>;
	data: BarDatum[];
	config: ChartConfig;
	labelWidth: number;
	/** Wider y-axis label width for the fullscreen dialog (defaults to labelWidth). */
	dialogLabelWidth?: number;
	previewCount?: number;
	domain?: [number, number];
	valueFormatter?: (v: number) => string;
	searchPlaceholder?: string;
	variant?: BarVariant;
}) {
	const { open, setOpen } = useChartDialog(chartKey);
	const [query, setQuery] = useState('');

	const preview = data.slice(0, previewCount);
	const filtered = query.trim() ? data.filter((d) => d.label.toLowerCase().includes(query.trim().toLowerCase())) : data;

	return (
		<ChartCard title={title} open={open} setOpen={setOpen} searchable={Boolean(searchPlaceholder)}>
			<HorizontalBarChart data={preview} config={config} labelWidth={labelWidth} domain={domain} valueFormatter={valueFormatter} variant={variant} />

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-3xl" aria-describedby={`${title} chart`}>
					<DialogHeader>
						<DialogTitle className="font-owl">{title}</DialogTitle>
					</DialogHeader>
					{searchPlaceholder && (
						<div className="relative">
							<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} className="h-9 pr-8" />
							{query && (
								<button
									type="button"
									onClick={() => setQuery('')}
									aria-label="Clear search"
									className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
									<X className="size-4" />
								</button>
							)}
						</div>
					)}
					{/* Fixed height keeps the (vertically-centered) dialog from jumping as the
					    result count — and thus the chart height — changes while searching. */}
					<ScrollArea className="h-[60vh] pr-3">
						{filtered.length > 0 ? (
							<HorizontalBarChart
								data={filtered}
								config={config}
								labelWidth={dialogLabelWidth ?? labelWidth}
								domain={domain}
								valueFormatter={valueFormatter}
								variant={variant}
							/>
						) : (
							<p className="flex h-full items-center justify-center text-sm text-muted-foreground">No matches.</p>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Reusable area (per-day) chart

/** Lighter orange (the 3rd ramp stop, matching the donut/top-3 bars) for the secondary per-day
 *  series — distinct from the vivid primary area but in the same palette. */
const SECONDARY_LINE = rampStop(4 / 6);

/** One plotted series (filled gradient area) in a per-day chart. Series sharing the left axis
 *  keep their real magnitudes (a bigger series sits visibly above a smaller one); a series with a
 *  wildly different scale (e.g. avg guesses vs. win-rate %) sets `secondaryAxis` to get its own
 *  right axis instead of being squashed flat. The tooltip always shows real values. */
type DaySeries = {
	dataKey: 'played' | 'winRate' | 'totalGuesses' | 'avgGuesses';
	color: string;
	/** Render against an independent right-hand axis rather than the shared left one. */
	secondaryAxis?: boolean;
	domain?: [number, number];
	axisFormatter?: (v: number) => string;
	tipFormatter?: (v: number) => string;
};

function AreaChartBody({
	data,
	config,
	series,
	idPrefix,
	className,
	asLines = false,
	referenceLines,
}: {
	data: DayPoint[];
	config: ChartConfig;
	series: DaySeries[];
	/** Unique per render so the gradient <defs> id never collides between the card and its dialog. */
	idPrefix: string;
	className: string;
	/** Render series as plain lines (no gradient fill). */
	asLines?: boolean;
	/** Horizontal dotted guide lines on the left axis (e.g. [25, 50, 75] for a 0–100 chart). */
	referenceLines?: number[];
}) {
	const isMobile = useIsMobile();
	return (
		<ChartContainer config={config} className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<AreaChart accessibilityLayer={!isMobile} data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
				<defs>
					{series.map((s, i) => (
						<linearGradient key={s.dataKey} id={`${idPrefix}-fill-${i}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
							<stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
						</linearGradient>
					))}
				</defs>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={dayLabel} interval="preserveStartEnd" />
				{(() => {
					// The left axis is driven by the first non-secondary series; an optional right axis is
					// added only when some series opts into its own scale.
					const left = series.find((s) => !s.secondaryAxis) ?? series[0];
					const right = series.find((s) => s.secondaryAxis);
					return (
						<>
							<YAxis
								yAxisId="left"
								domain={left.domain}
								tickLine={false}
								axisLine={false}
								tickMargin={4}
								width={left.domain || left.axisFormatter ? 40 : 36}
								tickFormatter={left.axisFormatter}
							/>
							{right && (
								<YAxis
									yAxisId="right"
									orientation="right"
									domain={right.domain}
									tickLine={false}
									axisLine={false}
									tickMargin={4}
									width={right.domain || right.axisFormatter ? 40 : 36}
									tickFormatter={right.axisFormatter}
								/>
							)}
						</>
					);
				})()}
				{referenceLines?.map((y) => (
					<ReferenceLine key={y} yAxisId="left" y={y} stroke="var(--muted-foreground)" strokeDasharray="2 4" strokeOpacity={0.5} />
				))}
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							indicator="line"
							labelFormatter={(label) => dayLabel(String(label))}
							formatter={(value, name, item) => {
								const s = series.find((x) => x.dataKey === name);
								const formatted = s?.tipFormatter ? s.tipFormatter(Number(value)) : Number(value).toLocaleString();
								return (
									<div className="flex w-full items-center justify-between gap-3">
										<span className="flex items-center gap-1.5 text-muted-foreground">
											<span className="h-2.5 w-1 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
											{config[name as string]?.label ?? name}
										</span>
										<span className="font-mono font-medium tabular-nums text-foreground">{formatted}</span>
									</div>
								);
							}}
						/>
					}
				/>
				{series.map((s, i) => (
					<Area
						key={s.dataKey}
						yAxisId={s.secondaryAxis ? 'right' : 'left'}
						dataKey={s.dataKey}
						type="monotone"
						stroke={s.color}
						strokeWidth={2}
						fill={asLines ? 'none' : `url(#${idPrefix}-fill-${i})`}
						dot={false}
						connectNulls
					/>
				))}
			</AreaChart>
		</ChartContainer>
	);
}

/** Per-day area chart card with an expand-to-fullscreen (taller) view. */
function AreaChartCard({
	title,
	chartKey,
	data,
	config,
	series,
	asLines,
	referenceLines,
}: {
	title: string;
	chartKey: Exclude<ChartKey, 'none'>;
	data: DayPoint[];
	config: ChartConfig;
	series: DaySeries[];
	asLines?: boolean;
	referenceLines?: number[];
}) {
	const { open, setOpen } = useChartDialog(chartKey);
	return (
		<ChartCard title={title} open={open} setOpen={setOpen}>
			<AreaChartBody
				data={data}
				config={config}
				series={series}
				asLines={asLines}
				referenceLines={referenceLines}
				idPrefix={`${chartKey}-card`}
				className="h-56 w-full"
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-6xl lg:max-w-7xl" aria-describedby={`${title} chart`}>
					<DialogHeader>
						<DialogTitle className="font-owl">{title}</DialogTitle>
					</DialogHeader>
					<AreaChartBody
						data={data}
						config={config}
						series={series}
						asLines={asLines}
						referenceLines={referenceLines}
						idPrefix={`${chartKey}-lg`}
						className="h-[60vh] w-full"
					/>
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Helpers

const playerCount = (n: number) => `${n.toLocaleString()} ${n === 1 ? 'guess' : 'guesses'}`;
const pctValue = (v: number) => `${v}%`;

/** Localized "Jun 5"-style label for a YYYY-MM-DD day, parsed/formatted in UTC so the
 *  calendar day never shifts across timezones. Uses the browser's locale. */
const dayLabel = (date: string) => new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

// Guess Distribution (donut)

type DonutSlice = { bucket: string; label: string; count: number; pct: number; fill: string };

// Slices carry their own `fill` and the tooltip uses a custom formatter, so the chart config
// only needs a benign entry (avoids ChartStyle emitting CSS vars from spaced label keys).
const guessDonutConfig = { count: { label: 'Games' } } satisfies ChartConfig;

/** Accent-orange ramp for the win buckets (1 = most saturated), a subtle red for "failed". */
function guessSliceColor(index: number, nonFailed: number, isFailed: boolean): string {
	if (isFailed) return 'hsl(3 62% 57%)';
	return rampStop(nonFailed > 1 ? index / (nonFailed - 1) : 0);
}

/** Outside label with a leader line connecting it to its slice, showing the bucket name
 *  (e.g. "3 guesses"). Near-empty slices (<2%) are skipped so labels don't collide. The active
 *  slice is drawn 6px larger, so its leader line starts from that enlarged edge (not the base
 *  radius) — otherwise the line would visibly cut through the slice. */
function renderSliceLabel(
	{
		cx,
		cy,
		midAngle,
		outerRadius,
		percent,
		index,
		payload,
	}: {
		cx?: number;
		cy?: number;
		midAngle?: number;
		outerRadius?: number;
		percent?: number;
		index?: number;
		payload?: DonutSlice;
	},
	activeIndex: number
) {
	if (!payload || (percent ?? 0) < 0.02) return null;
	const RAD = Math.PI / 180;
	const cos = Math.cos(-Number(midAngle ?? 0) * RAD);
	const sin = Math.sin(-Number(midAngle ?? 0) * RAD);
	const or = Number(outerRadius ?? 0) + (index === activeIndex ? 6 : 0);
	const x0 = Number(cx ?? 0) + or * cos;
	const y0 = Number(cy ?? 0) + or * sin;
	const x1 = Number(cx ?? 0) + (or + 12) * cos;
	const y1 = Number(cy ?? 0) + (or + 12) * sin;
	const right = cos >= 0;
	const x2 = x1 + (right ? 12 : -12);
	return (
		<g>
			<polyline points={`${x0},${y0} ${x1},${y1} ${x2},${y1}`} className="fill-none stroke-foreground" strokeWidth={1} />
			<text x={x2 + (right ? 4 : -4)} y={y1} textAnchor={right ? 'start' : 'end'} dominantBaseline="central" className="fill-foreground text-xs">
				{payload.label}
			</text>
		</g>
	);
}

function GuessDonut({
	slices,
	averageGuesses,
	activeIndex,
	className,
}: {
	slices: DonutSlice[];
	averageGuesses: number | null;
	activeIndex: number;
	className: string;
}) {
	const isMobile = useIsMobile();
	const innerRadius = isMobile ? '42%' : '50%';
	const outerRadius = isMobile ? '58%' : '70%';
	return (
		<ChartContainer config={guessDonutConfig} className={`mx-auto ${className}`}>
			<PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							nameKey="label"
							hideLabel
							formatter={(val, _n, item) => {
								const p = item?.payload as DonutSlice;
								return `${p.label}: ${Number(val).toLocaleString()} (${p.pct}%)`;
							}}
						/>
					}
				/>
				<Pie
					data={slices}
					dataKey="count"
					nameKey="label"
					innerRadius={innerRadius}
					outerRadius={outerRadius}
					paddingAngle={2}
					stroke="var(--card)"
					strokeWidth={2}
					label={(props) => renderSliceLabel(props, activeIndex)}
					labelLine={false}
					shape={({ index, outerRadius = 0, ...props }: PieSectorDataItem & { index?: number }) =>
						index === activeIndex ? <Sector {...props} outerRadius={outerRadius + 6} /> : <Sector {...props} outerRadius={outerRadius} />
					}>
					<Label
						content={({ viewBox }) => {
							if (!viewBox || !('cx' in viewBox)) return null;
							const cx = viewBox.cx ?? 0;
							const cy = viewBox.cy ?? 0;
							return (
								<text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
									<tspan x={cx} y={cy - 6} className="fill-foreground text-3xl font-owl">
										{averageGuesses?.toFixed(1) ?? '—'}
									</tspan>
									<tspan x={cx} y={cy + 18} className="fill-muted-foreground text-xs">
										avg guesses
									</tspan>
								</text>
							);
						}}
					/>
				</Pie>
			</PieChart>
		</ChartContainer>
	);
}

export function GuessDistributionChart({ data, averageGuesses }: { data: GuessBucket[]; averageGuesses: number | null }) {
	const { open, setOpen } = useChartDialog('guess');
	if (data.length === 0) return null;

	const total = data.reduce((sum, d) => sum + d.count, 0);
	const nonFailed = data.filter((d) => d.bucket !== 'failed').length;
	const slices: DonutSlice[] = data.map((d) => {
		const isFailed = d.bucket === 'failed';
		return {
			bucket: d.bucket,
			label: isFailed ? 'Failed' : `${d.bucket} ${d.bucket === '1' ? 'guess' : 'guesses'}`,
			count: d.count,
			pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
			fill: guessSliceColor(isFailed ? 0 : Number(d.bucket) - 1, nonFailed, isFailed),
		};
	});
	// Highlight the biggest slice.
	const activeIndex = slices.reduce((best, s, i, arr) => (s.count > arr[best].count ? i : best), 0);

	return (
		<ChartCard title="Guess Distribution" open={open} setOpen={setOpen}>
			{/* Fill the (grid-stretched) card height so this card matches its taller neighbour and the
			    donut centers in whatever vertical space is available. */}
			<div className="flex flex-1 flex-col">
				<p className="-mt-1 mb-1 text-xs text-muted-foreground">Share of games by how many guesses it took to win</p>
				{/* flex-1 + min-height lets the donut grow to fill the card (matching the taller bar-chart
				    neighbour on desktop) while still having a sensible size when stacked on mobile. */}
				<div className="flex min-h-72 flex-1 items-center justify-center">
					<GuessDonut slices={slices} averageGuesses={averageGuesses} activeIndex={activeIndex} className="aspect-auto size-full max-w-2xl" />
				</div>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-2xl" aria-describedby="Guess Distribution chart">
					<DialogHeader>
						<DialogTitle className="font-owl">Guess Distribution</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">Share of games by how many guesses it took to win</p>
					<GuessDonut slices={slices} averageGuesses={averageGuesses} activeIndex={activeIndex} className="aspect-square w-full max-w-115" />
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Most Popular First Guess

const firstGuessConfig = { value: { label: 'Players', color: 'var(--secondary)' } } satisfies ChartConfig;

export function FirstGuessChart({ data, previewCount }: { data: NamedCount[]; previewCount?: number }) {
	if (data.length === 0) return null;
	const bars: BarDatum[] = data.map((d, i) => ({ label: d.name, value: d.count, rank: i + 1, tip: `${d.name}, #${i + 1} · ${playerCount(d.count)}` }));
	return (
		<BarChartCard
			title="Most Popular First Guess"
			chartKey="firstGuess"
			data={bars}
			config={firstGuessConfig}
			labelWidth={44}
			previewCount={previewCount}
			searchPlaceholder="Search player…"
		/>
	);
}

// Most Popular First Team

const firstTeamConfig = { value: { label: 'Players', color: 'var(--secondary)' } } satisfies ChartConfig;

export function FirstTeamChart({ data, previewCount }: { data: TeamCount[]; previewCount?: number }) {
	if (data.length === 0) return null;
	const bars: BarDatum[] = data.map((d, i) => ({ label: d.team, value: d.count, rank: i + 1, tip: `${d.team}, #${i + 1} · ${playerCount(d.count)}` }));
	return (
		<BarChartCard
			title="Most Popular First Team"
			chartKey="firstTeam"
			data={bars}
			config={firstTeamConfig}
			labelWidth={44}
			previewCount={previewCount}
			searchPlaceholder="Search team…"
		/>
	);
}

// Games Played Per Day

const gamesPerDayConfig = {
	played: { label: 'Games', color: 'var(--primary-foreground)' },
	totalGuesses: { label: 'Total Guesses', color: SECONDARY_LINE },
} satisfies ChartConfig;

export function GamesPerDayChart({ data }: { data: DayPoint[] }) {
	if (data.length === 0) return null;
	return (
		<AreaChartCard
			title="Games Played Per Day"
			chartKey="gamesPerDay"
			data={data}
			config={gamesPerDayConfig}
			series={[
				{ dataKey: 'played', color: 'var(--primary-foreground)' },
				{ dataKey: 'totalGuesses', color: SECONDARY_LINE },
			]}
		/>
	);
}

// Win Rate Per Day

const winRateConfig = {
	winRate: { label: 'Win Rate', color: SECONDARY_LINE },
	avgGuesses: { label: 'Avg Guesses', color: 'var(--primary-foreground)' },
} satisfies ChartConfig;

export function WinRatePerDayChart({ data }: { data: DayPoint[] }) {
	if (data.length === 0) return null;
	return (
		<AreaChartCard
			title="Win Rate Per Day"
			chartKey="winRate"
			data={data}
			config={winRateConfig}
			asLines
			referenceLines={[25, 50, 75]}
			series={[
				{ dataKey: 'winRate', color: SECONDARY_LINE, domain: [0, 100], axisFormatter: pctValue, tipFormatter: pctValue },
				// Avg guesses lives on a far smaller scale than win-rate %, so it gets its own right axis;
				// the generous top keeps it reading as a low band beneath the win-rate area.
				{ dataKey: 'avgGuesses', color: 'var(--primary-foreground)', secondaryAxis: true, domain: [0, 10], tipFormatter: (v) => v.toFixed(1) },
			]}
		/>
	);
}

// Hardest Answers — value (%) inside the bar, player name on the right (the hardest answers have
// low win rates, so the bars are short; the % is short enough to sit inside).

const hardestConfig = { value: { label: 'Win Rate', color: 'var(--secondary)' } } satisfies ChartConfig;

export function HardestPuzzlesChart({ data, previewCount }: { data: HardPuzzle[]; previewCount?: number }) {
	if (data.length === 0) return null;
	const bars: BarDatum[] = data.map((d, i) => ({
		label: d.player,
		value: d.winRate,
		rank: i + 1,
		tip: `${d.player}, #${i + 1} · ${d.winRate}% win rate · ${playerCount(d.played)}`,
	}));
	return (
		<BarChartCard
			title="Hardest Answers"
			chartKey="hardest"
			data={bars}
			config={hardestConfig}
			labelWidth={44}
			previewCount={previewCount}
			domain={[0, 100]}
			valueFormatter={pctValue}
			searchPlaceholder="Search player…"
			variant="value-inside"
		/>
	);
}
