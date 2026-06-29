'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartCard, rampStop } from '@/components/statistics/StatCharts';
import { type ChartKey, useChartDialog } from '@/hooks/use-chart-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { type DayBucket, type DayMetricKey, groupDayPoints, metricTotal, metricValue, usePerDay } from '@/hooks/use-per-day';
import { cn } from '@/lib/utils';
import { datasetInfo } from '@/data/datasets';
import type { DayCounts, DayGrouping, DayScope, TimeframeRange } from '@/types/statistics';

const ACCENT = 'var(--primary-foreground)';
const SECONDARY = rampStop(4 / 6); // lighter orange, matches the 3rd bar/donut stop

export type PerDayParams = { dataset: string; range: TimeframeRange; from: string | null; to: string | null; stage?: string };

/** Shared grouping + scope state (lifted to the dashboard so the hotkeys drive every per-day chart). */
export type PerDayControlsState = { grouping: DayGrouping; setGrouping: (g: DayGrouping) => void; scope: DayScope; setScope: (s: DayScope) => void };

/** Grouping/scope hotkeys (mirrored as kbd chips in the dropdowns and handled on the dashboard). */
export const GROUPING_HOTKEYS: { value: DayGrouping; label: string; key: string }[] = [
	{ value: 'days', label: 'Days', key: 'j' },
	{ value: 'weeks', label: 'Weeks', key: 'k' },
	{ value: 'months', label: 'Months', key: 'l' },
];
export const SCOPE_HOTKEYS: { value: DayScope; label: string; key: string }[] = [
	{ value: 'current', label: 'This mode', key: 'i' },
	{ value: 'all', label: 'All modes', key: 'o' },
];

type MetricMeta = { key: DayMetricKey; label: string; format: (v: number) => string };
const METRICS: MetricMeta[] = [
	{ key: 'played', label: 'Games Played', format: (v) => v.toLocaleString() },
	{ key: 'winRate', label: 'Win Rate', format: (v) => `${v}%` },
	{ key: 'avgGuesses', label: 'Avg Guesses', format: (v) => v.toFixed(1) },
	{ key: 'totalGuesses', label: 'Total Guesses', format: (v) => v.toLocaleString() },
	{ key: 'won', label: 'Games Won', format: (v) => v.toLocaleString() },
];
const metaFor = (m: DayMetricKey) => METRICS.find((x) => x.key === m) ?? METRICS[0];

/** Localized bucket label (UTC). Months show "Jun 26"; days/weeks show "Jun 5". */
function bucketLabel(date: string, grouping: DayGrouping): string {
	const opts: Intl.DateTimeFormatOptions =
		grouping === 'months' ? { month: 'short', year: '2-digit', timeZone: 'UTC' } : { month: 'short', day: 'numeric', timeZone: 'UTC' };
	return new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, opts);
}

/** Tooltip header for a bucket: a plain day, or "Week of …" / "Month of …" for coarser groupings.
 *  Days/weeks gain the year when the bucket falls in a year other than the current one. */
function tooltipDateLabel(date: string, grouping: DayGrouping): string {
	const d = new Date(`${date}T00:00:00.000Z`);
	if (grouping === 'months') return `Month of ${d.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })}`;
	const olderYear = d.getUTCFullYear() !== new Date().getUTCFullYear();
	const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC', ...(olderYear ? { year: 'numeric' } : {}) };
	const day = d.toLocaleDateString(undefined, opts);
	return grouping === 'weeks' ? `Week of ${day}` : day;
}

/** Window length (in days) at which the per-day charts default from days to weeks. ~9 months. Tweak freely. */
export const DEFAULT_WEEKS_THRESHOLD_DAYS = 270;

/** Default to weeks once the window passes the threshold, otherwise days. */
export function defaultGrouping(fromIso?: string, toIso?: string): DayGrouping {
	if (!fromIso || !toIso) return 'days';
	const days = (Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000;
	return days > DEFAULT_WEEKS_THRESHOLD_DAYS ? 'weeks' : 'days';
}

/** Per-mode grouping for the all-modes tooltip: OWL datasets vs. everything else (Champion Series). */
type ModeKey = 'owl' | 'owcs';
const MODE_LABELS: Record<ModeKey, string> = { owl: 'Overwatch League', owcs: 'Champion Series' };
const MODE_ORDER: ModeKey[] = ['owl', 'owcs'];
const datasetMode = (dataset: string): ModeKey => (datasetInfo.find((d) => d.dataset === dataset)?.league === 'owl' ? 'owl' : 'owcs');

/** Tidy axis ceiling: pick a "nice" step (~5 intervals) and round the max up to it, with a touch of
 *  headroom. Avoids recharts' default over-padding (e.g. a max of 415 ending at 600). */
function niceMax(dataMax: number): number {
	if (dataMax <= 0) return 1;
	const rough = dataMax / 5;
	const mag = 10 ** Math.floor(Math.log10(rough));
	const norm = rough / mag;
	const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
	return Math.ceil((dataMax * 1.001) / step) * step;
}

// ---- Tabs (metric switcher with timeframe totals) ----------------------------------------

function MetricTabs({ points, metric, setMetric }: { points: DayBucket[]; metric: DayMetricKey; setMetric: (m: DayMetricKey) => void }) {
	return (
		<div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 py-1">
			{METRICS.map((m) => {
				const total = metricTotal(points, m.key);
				const active = m.key === metric;
				return (
					<button
						key={m.key}
						type="button"
						onClick={() => setMetric(m.key)}
						className={cn(
							'flex min-w-26 shrink-0 flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground',
							active ? 'border-primary-foreground/40 bg-primary-foreground/10' : 'border-border/60 hover:bg-muted/50'
						)}>
						<span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
						<span className={cn('font-owl text-xl tabular-nums', active ? 'text-primary-foreground' : 'text-foreground')}>
							{total == null ? '—' : m.format(total)}
						</span>
					</button>
				);
			})}
		</div>
	);
}

function HotkeyItem({ label, hotkey }: { label: string; hotkey: string }) {
	return (
		<span className="flex items-center gap-3">
			<span className="min-w-24">{label}</span>
			<kbd className="hidden h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 text-[0.65rem] font-medium uppercase text-muted-foreground sm:inline-flex">
				{hotkey}
			</kbd>
		</span>
	);
}

function PerDayControls({ grouping, setGrouping, scope, setScope }: PerDayControlsState) {
	return (
		// Mobile: stretch the two selects to fill their (own) row evenly. Desktop: compact, content-sized.
		<div className="flex w-full items-center gap-2 sm:w-auto">
			<Select value={scope} onValueChange={(v) => setScope(v as DayScope)}>
				<SelectTrigger className="h-8 min-w-28 flex-1 text-xs sm:w-auto sm:flex-none" aria-label="Dataset scope">
					{/* Render the label explicitly so the kbd chip never leaks into the trigger. */}
					<SelectValue>{SCOPE_HOTKEYS.find((s) => s.value === scope)?.label}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{SCOPE_HOTKEYS.map((s) => (
						<SelectItem key={s.value} value={s.value}>
							<HotkeyItem label={s.label} hotkey={s.key} />
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select value={grouping} onValueChange={(v) => setGrouping(v as DayGrouping)}>
				<SelectTrigger className="h-8 min-w-24 flex-1 text-xs sm:w-auto sm:flex-none" aria-label="Group by">
					<SelectValue>{GROUPING_HOTKEYS.find((g) => g.value === grouping)?.label}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{GROUPING_HOTKEYS.map((g) => (
						<SelectItem key={g.value} value={g.value}>
							<HotkeyItem label={g.label} hotkey={g.key} />
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

// ---- Tooltip -----------------------------------------------------------------------------

type TipRow = { answer?: string; breakdown?: ({ dataset: string } & DayCounts)[] };
type TipItem = { value?: number | null; dataKey?: string | number; color?: string; payload?: TipRow };

const fmtMetric = (metric: DayMetricKey, v?: number | null) => (v == null ? '—' : metaFor(metric).format(Number(v)));

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
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

function PerDayTooltip({
	active,
	payload,
	label,
	grouping,
	scope,
	series,
	showAnswer,
}: {
	active?: boolean;
	payload?: TipItem[];
	label?: string | number;
	grouping: DayGrouping;
	scope: DayScope;
	series: SeriesSpec[];
	showAnswer: boolean;
}) {
	if (!active || !payload?.length) return null;
	const row = payload[0]?.payload;
	const breakdown = row?.breakdown;
	const primary = series[0];
	const primaryItem = payload.find((p) => p.dataKey === primary.metric);

	// All-modes: collapse the per-dataset breakdown into the two modes (OWL vs. Champion Series).
	const byMode = new Map<ModeKey, DayCounts>();
	if (breakdown) {
		for (const e of breakdown) {
			const m = datasetMode(e.dataset);
			const acc = byMode.get(m) ?? { played: 0, wins: 0, totalGuesses: 0, winGuessSum: 0 };
			acc.played += e.played;
			acc.wins += e.wins;
			acc.totalGuesses += e.totalGuesses;
			acc.winGuessSum += e.winGuessSum;
			byMode.set(m, acc);
		}
	}

	return (
		<div className="grid min-w-44 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<div className="font-medium">{tooltipDateLabel(String(label), grouping)}</div>

			{scope === 'all' && byMode.size > 0 ? (
				<>
					{MODE_ORDER.filter((m) => byMode.has(m)).map((m) => (
						<MetricRow key={m} label={MODE_LABELS[m]} value={fmtMetric(primary.metric, metricValue(byMode.get(m) as DayCounts, primary.metric))} />
					))}
					<div className="my-0.5 h-px bg-border/60" />
					<MetricRow label={`Total ${metaFor(primary.metric).label}`} value={fmtMetric(primary.metric, primaryItem?.value)} color={primaryItem?.color} />
					{payload
						.filter((p) => p.dataKey !== primary.metric)
						.map((item) => (
							<MetricRow
								key={String(item.dataKey)}
								label={metaFor(String(item.dataKey) as DayMetricKey).label}
								value={fmtMetric(String(item.dataKey) as DayMetricKey, item.value)}
								color={item.color}
							/>
						))}
				</>
			) : (
				payload.map((item) => (
					<MetricRow
						key={String(item.dataKey)}
						label={metaFor(String(item.dataKey) as DayMetricKey).label}
						value={fmtMetric(String(item.dataKey) as DayMetricKey, item.value)}
						color={item.color}
					/>
				))
			)}

			{showAnswer && row?.answer && (
				<>
					<div className="my-0.5 h-px bg-border/60" />
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Answer</span>
						<span className="font-medium text-foreground">{row.answer}</span>
					</div>
				</>
			)}
		</div>
	);
}

// ---- Area chart body ---------------------------------------------------------------------

type SeriesSpec = { metric: DayMetricKey; color: string; axis: 'left' | 'right'; asLine: boolean; domain?: [number, number] };

function PerDayAreaBody({
	buckets,
	series,
	grouping,
	scope,
	idPrefix,
	className,
	referenceLines,
}: {
	buckets: DayBucket[];
	series: SeriesSpec[];
	grouping: DayGrouping;
	scope: DayScope;
	idPrefix: string;
	className: string;
	referenceLines?: number[];
}) {
	const isMobile = useIsMobile();
	const showAnswer = grouping === 'days' && scope === 'current';

	if (buckets.length === 0) {
		return <div className={cn('flex items-center justify-center text-sm text-muted-foreground', className)}>No data in this timeframe.</div>;
	}

	const chartData = buckets.map((b) => {
		const row: Record<string, unknown> = { date: b.date, answer: b.answer, breakdown: b.breakdown };
		for (const s of series) row[s.metric] = metricValue(b, s.metric);
		return row;
	});

	const domainFor = (s: SeriesSpec): [number, number] => {
		if (s.domain) return s.domain;
		if (s.metric === 'winRate') return [0, 100];
		const max = buckets.reduce((m, b) => Math.max(m, metricValue(b, s.metric) ?? 0), 0);
		return [0, niceMax(max)];
	};
	const axisFormatterFor = (metric: DayMetricKey) =>
		metric === 'winRate' ? (v: number) => `${v}%` : metric === 'avgGuesses' ? (v: number) => v.toFixed(1) : undefined;

	const left = series.find((s) => s.axis === 'left') ?? series[0];
	const right = series.find((s) => s.axis === 'right');
	const config = Object.fromEntries(series.map((s) => [s.metric, { label: metaFor(s.metric).label, color: s.color }]));

	return (
		<ChartContainer config={config} className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<AreaChart accessibilityLayer={!isMobile} data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
				<defs>
					{series.map((s) => (
						<linearGradient key={s.metric} id={`${idPrefix}-${s.metric}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
							<stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
						</linearGradient>
					))}
				</defs>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={28}
					interval="preserveStartEnd"
					tickFormatter={(d) => bucketLabel(String(d), grouping)}
				/>
				<YAxis
					yAxisId="left"
					domain={domainFor(left)}
					tickLine={false}
					axisLine={false}
					tickMargin={4}
					width={40}
					tickFormatter={axisFormatterFor(left.metric)}
				/>
				{right && (
					<YAxis
						yAxisId="right"
						orientation="right"
						domain={domainFor(right)}
						tickLine={false}
						axisLine={false}
						tickMargin={4}
						width={40}
						tickFormatter={axisFormatterFor(right.metric)}
					/>
				)}
				{referenceLines?.map((y) => (
					<ReferenceLine key={y} yAxisId="left" y={y} stroke="var(--muted-foreground)" strokeDasharray="2 4" strokeOpacity={0.5} />
				))}
				<ChartTooltip cursor={false} content={<PerDayTooltip grouping={grouping} scope={scope} series={series} showAnswer={showAnswer} />} />
				{series.map((s) => (
					<Area
						key={s.metric}
						yAxisId={s.axis}
						dataKey={s.metric}
						type="monotone"
						stroke={s.color}
						strokeWidth={2}
						fill={s.asLine ? 'none' : `url(#${idPrefix}-${s.metric})`}
						dot={false}
						connectNulls
					/>
				))}
			</AreaChart>
		</ChartContainer>
	);
}

// ---- Charts ------------------------------------------------------------------------------

function usePerDayBuckets(params: PerDayParams, scope: DayScope, grouping: DayGrouping) {
	const { data } = usePerDay({ ...params, scope });
	const points = data?.perDay ?? [];
	return useMemo(() => groupDayPoints(points, grouping), [points, grouping]);
}

/** Trends Over Time, single accent area; metric chosen via the tabs (default: games played). */
export function TrendsOverTimeChart({ params, grouping, setGrouping, scope, setScope }: { params: PerDayParams } & PerDayControlsState) {
	const [metric, setMetric] = useState<DayMetricKey>('played');
	const buckets = usePerDayBuckets(params, scope, grouping);
	const { open, setOpen } = useChartDialog('gamesPerDay');
	const controls = <PerDayControls grouping={grouping} setGrouping={setGrouping} scope={scope} setScope={setScope} />;
	const series: SeriesSpec[] = [{ metric, color: ACCENT, axis: 'left', asLine: false }];

	const body = (className: string, idPrefix: string) => (
		<>
			<MetricTabs points={buckets} metric={metric} setMetric={setMetric} />
			<PerDayAreaBody buckets={buckets} series={series} grouping={grouping} scope={scope} idPrefix={idPrefix} className={className} />
		</>
	);

	return (
		<ChartCard title="Trends Over Time" open={open} setOpen={setOpen} headerActions={controls}>
			{body('h-64 w-full', 'games-card')}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="w-[95vw] sm:max-w-6xl lg:max-w-400"
					aria-describedby="Trends Over Time chart"
					headerActions={<div className="hidden items-center gap-2 sm:flex mr-2">{controls}</div>}>
					<DialogHeader>
						<DialogTitle className="font-owl">Trends Over Time</DialogTitle>
					</DialogHeader>
					{/* Desktop controls sit beside the close icon (headerActions); mobile gets its own row. */}
					<div className="flex justify-center sm:hidden">{controls}</div>
					{body('h-[60vh] w-full', 'games-lg')}
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

/** Win Rate — win-rate line (25/50/75% dotted guides) plus the avg-guesses line on its own axis. */
export function WinRatePerDayChart({ params, grouping, setGrouping, scope, setScope }: { params: PerDayParams } & PerDayControlsState) {
	const buckets = usePerDayBuckets(params, scope, grouping);
	const { open, setOpen } = useChartDialog('winRate');
	const controls = <PerDayControls grouping={grouping} setGrouping={setGrouping} scope={scope} setScope={setScope} />;
	// Trim the unused bottom: floor the win-rate axis to ~10 below the lowest value (capped at 50 so
	// the chart keeps useful context), centering data that mostly sits in the upper range.
	const winRates = buckets.map((b) => metricValue(b, 'winRate') ?? 0).filter((_v, i) => buckets[i].played > 0);
	const winRateMin = winRates.length ? Math.min(...winRates) : 0;
	const winRateFloor = Math.max(0, Math.min(50, Math.floor((winRateMin - 5) / 10) * 10));
	const series: SeriesSpec[] = [
		{ metric: 'winRate', color: ACCENT, axis: 'left', asLine: true, domain: [winRateFloor, 100] },
		{ metric: 'avgGuesses', color: SECONDARY, axis: 'right', asLine: true },
	];

	const body = (className: string, idPrefix: string) => (
		<PerDayAreaBody
			buckets={buckets}
			series={series}
			grouping={grouping}
			scope={scope}
			idPrefix={idPrefix}
			className={className}
			referenceLines={[25, 50, 75]}
		/>
	);

	return (
		<ChartCard title="Win Rate Per Day" open={open} setOpen={setOpen} headerActions={controls}>
			{body('h-64 w-full', 'winrate-card')}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="w-[95vw] sm:max-w-6xl lg:max-w-400"
					aria-describedby="Win Rate Per Day chart"
					headerActions={<div className="hidden items-center gap-2 sm:flex mr-2">{controls}</div>}>
					<DialogHeader>
						<DialogTitle className="font-owl">Win Rate Per Day</DialogTitle>
					</DialogHeader>
					<div className="flex justify-center sm:hidden">{controls}</div>
					{body('h-[60vh] w-full', 'winrate-lg')}
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}
