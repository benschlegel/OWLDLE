'use client';

import { Maximize2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

/** Card shell with a title, separator, and an optional expand-to-fullscreen button. */
function ChartCard({ title, onExpand, children }: { title: string; onExpand?: () => void; children: ReactNode }) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="p-4 pb-2">
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-lg font-owl">{title}</CardTitle>
					{onExpand && (
						<Button
							variant="ghost"
							size="icon"
							className="size-7 -mr-1 text-muted-foreground hover:text-foreground"
							onClick={onExpand}
							aria-label={`Expand ${title}`}>
							<Maximize2 className="size-4" />
						</Button>
					)}
				</div>
				<Separator />
			</CardHeader>
			<CardContent className="p-4 pt-2">{children}</CardContent>
		</Card>
	);
}

// Reusable horizontal bar chart

type BarDatum = { label: string; value: number; tip: string; rank?: number };

function HorizontalBarChart({
	data,
	config,
	labelWidth,
	domain,
	valueFormatter,
	showRank = false,
	minPointSize,
}: {
	data: BarDatum[];
	config: ChartConfig;
	labelWidth: number;
	domain?: [number, number];
	valueFormatter?: (v: number) => string;
	showRank?: boolean;
	/** Minimum bar length in px so zero/near-zero values stay visible (matches the in-game distribution). */
	minPointSize?: number;
}) {
	const isMobile = useIsMobile();
	const height = data.length * 40 + 16;
	return (
		<ChartContainer config={config} style={{ height }} className={`w-full aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<BarChart accessibilityLayer={!isMobile} data={data} layout="vertical" margin={{ right: valueFormatter ? 56 : 48, left: 4 }}>
				<CartesianGrid horizontal={false} />
				<YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={8} width={labelWidth} />
				<XAxis type="number" domain={domain} hide />
				<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(_v, _n, item) => (item?.payload as BarDatum)?.tip ?? ''} />} />
				<Bar dataKey="value" radius={4} className="fill-secondary" minPointSize={minPointSize}>
					{showRank && (
						<LabelList
							dataKey="rank"
							position="insideLeft"
							offset={8}
							className="fill-secondary-foreground text-xs font-medium"
							formatter={(v: unknown) => `#${v}`}
						/>
					)}
					<LabelList
						dataKey="value"
						position="right"
						offset={8}
						className="fill-foreground text-xs"
						formatter={valueFormatter ? (v: unknown) => valueFormatter(Number(v)) : undefined}
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}

/**
 * A chart card backed by a bar list. Shows the first `previewCount` bars and an
 * expand button opening a fullscreen dialog with the full (scrollable) list,
 * plus optional client-side search when `searchPlaceholder` is provided.
 */
function BarChartCard({
	title,
	data,
	config,
	labelWidth,
	dialogLabelWidth,
	previewCount = 8,
	domain,
	valueFormatter,
	searchPlaceholder,
	showRank = false,
	minPointSize,
}: {
	title: string;
	data: BarDatum[];
	config: ChartConfig;
	labelWidth: number;
	/** Wider y-axis label width for the fullscreen dialog (defaults to labelWidth). */
	dialogLabelWidth?: number;
	previewCount?: number;
	domain?: [number, number];
	valueFormatter?: (v: number) => string;
	searchPlaceholder?: string;
	showRank?: boolean;
	minPointSize?: number;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	const preview = data.slice(0, previewCount);
	const filtered = query.trim() ? data.filter((d) => d.label.toLowerCase().includes(query.trim().toLowerCase())) : data;

	return (
		<ChartCard title={title} onExpand={() => setOpen(true)}>
			<HorizontalBarChart
				data={preview}
				config={config}
				labelWidth={labelWidth}
				domain={domain}
				valueFormatter={valueFormatter}
				showRank={showRank}
				minPointSize={minPointSize}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-3xl" aria-describedby={`${title} chart`}>
					<DialogHeader>
						<DialogTitle className="font-owl">{title}</DialogTitle>
					</DialogHeader>
					{searchPlaceholder && <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} className="h-9" />}
					<ScrollArea className="max-h-[60vh] pr-3">
						{filtered.length > 0 ? (
							<HorizontalBarChart
								data={filtered}
								config={config}
								labelWidth={dialogLabelWidth ?? labelWidth}
								domain={domain}
								valueFormatter={valueFormatter}
								showRank={showRank}
								minPointSize={minPointSize}
							/>
						) : (
							<p className="text-sm text-muted-foreground py-12 text-center">No matches.</p>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Reusable area (per-day) chart

function AreaChartBody({
	data,
	config,
	dataKey,
	gradientId,
	className,
	domain,
	valueFormatter,
}: {
	data: DayPoint[];
	config: ChartConfig;
	dataKey: 'played' | 'winRate';
	gradientId: string;
	className: string;
	domain?: [number, number];
	valueFormatter?: (v: number) => string;
}) {
	const isMobile = useIsMobile();
	return (
		<ChartContainer config={config} className={`${className} aspect-auto ${isMobile ? '**:outline-none!' : ''}`}>
			<AreaChart accessibilityLayer={!isMobile} data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="var(--primary-foreground)" stopOpacity={0.25} />
						<stop offset="95%" stopColor="var(--primary-foreground)" stopOpacity={0.02} />
					</linearGradient>
				</defs>
				<CartesianGrid vertical={false} />
				<XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={dayLabel} interval="preserveStartEnd" />
				<YAxis domain={domain} tickLine={false} axisLine={false} tickMargin={4} width={domain ? 40 : 36} tickFormatter={valueFormatter} />
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							indicator="line"
							labelFormatter={(label) => dayLabel(String(label))}
							formatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined}
						/>
					}
				/>
				<Area dataKey={dataKey} type="monotone" stroke="var(--primary-foreground)" strokeWidth={2} fill={`url(#${gradientId})`} />
			</AreaChart>
		</ChartContainer>
	);
}

/** Per-day area chart card with an expand-to-fullscreen (taller) view. */
function AreaChartCard({
	title,
	data,
	config,
	dataKey,
	gradientId,
	domain,
	valueFormatter,
}: {
	title: string;
	data: DayPoint[];
	config: ChartConfig;
	dataKey: 'played' | 'winRate';
	gradientId: string;
	domain?: [number, number];
	valueFormatter?: (v: number) => string;
}) {
	const [open, setOpen] = useState(false);
	return (
		<ChartCard title={title} onExpand={() => setOpen(true)}>
			<AreaChartBody
				data={data}
				config={config}
				dataKey={dataKey}
				gradientId={gradientId}
				domain={domain}
				valueFormatter={valueFormatter}
				className="h-56 w-full"
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-5xl" aria-describedby={`${title} chart`}>
					<DialogHeader>
						<DialogTitle className="font-owl">{title}</DialogTitle>
					</DialogHeader>
					<AreaChartBody
						data={data}
						config={config}
						dataKey={dataKey}
						gradientId={`${gradientId}-lg`}
						domain={domain}
						valueFormatter={valueFormatter}
						className="h-[55vh] w-full"
					/>
				</DialogContent>
			</Dialog>
		</ChartCard>
	);
}

// Helpers

const playerCount = (n: number) => `${n.toLocaleString()} ${n === 1 ? 'player' : 'players'}`;
const pctValue = (v: number) => `${v}%`;

/** Localized "Jun 5"-style label for a YYYY-MM-DD day, parsed/formatted in UTC so the
 *  calendar day never shifts across timezones. Uses the browser's locale. */
const dayLabel = (date: string) => new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

// Guess Distribution

const guessDistConfig = { value: { label: 'Share', color: 'var(--secondary)' } } satisfies ChartConfig;

export function GuessDistributionChart({ data }: { data: GuessBucket[] }) {
	if (data.length === 0) return null;
	const total = data.reduce((sum, d) => sum + d.count, 0);
	const bars: BarDatum[] = data.map((d) => ({
		label: d.bucket,
		value: total > 0 ? Math.round((d.count / total) * 100) : 0,
		tip: playerCount(d.count),
	}));
	return (
		<BarChartCard
			title="Guess Distribution"
			data={bars}
			config={guessDistConfig}
			labelWidth={50}
			previewCount={bars.length}
			valueFormatter={pctValue}
			minPointSize={8}
		/>
	);
}

// Most Popular First Guess

const firstGuessConfig = { value: { label: 'Players', color: 'var(--secondary)' } } satisfies ChartConfig;

export function FirstGuessChart({ data, previewCount }: { data: NamedCount[]; previewCount?: number }) {
	if (data.length === 0) return null;
	const bars: BarDatum[] = data.map((d, i) => ({ label: d.name, value: d.count, rank: i + 1, tip: `#${i + 1} · ${playerCount(d.count)}` }));
	return (
		<BarChartCard
			title="Most Popular First Guess"
			data={bars}
			config={firstGuessConfig}
			labelWidth={88}
			previewCount={previewCount}
			searchPlaceholder="Search player…"
			showRank
		/>
	);
}

// Most Popular First Team

const firstTeamConfig = { value: { label: 'Players', color: 'var(--secondary)' } } satisfies ChartConfig;

export function FirstTeamChart({ data, previewCount }: { data: TeamCount[]; previewCount?: number }) {
	if (data.length === 0) return null;
	const bars: BarDatum[] = data.map((d, i) => ({ label: d.team, value: d.count, rank: i + 1, tip: `#${i + 1} · ${playerCount(d.count)}` }));
	return (
		<BarChartCard
			title="Most Popular First Team"
			data={bars}
			config={firstTeamConfig}
			labelWidth={110}
			dialogLabelWidth={150}
			previewCount={previewCount}
			searchPlaceholder="Search team…"
			showRank
		/>
	);
}

// Games Played Per Day

const gamesPerDayConfig = { played: { label: 'Games', color: 'var(--primary-foreground)' } } satisfies ChartConfig;

export function GamesPerDayChart({ data }: { data: DayPoint[] }) {
	if (data.length === 0) return null;
	return <AreaChartCard title="Games Played Per Day" data={data} config={gamesPerDayConfig} dataKey="played" gradientId="gamesAreaFill" />;
}

// Win Rate Per Day

const winRateConfig = { winRate: { label: 'Win Rate', color: 'var(--primary-foreground)' } } satisfies ChartConfig;

export function WinRatePerDayChart({ data }: { data: DayPoint[] }) {
	if (data.length === 0) return null;
	return (
		<AreaChartCard
			title="Win Rate Per Day"
			data={data}
			config={winRateConfig}
			dataKey="winRate"
			gradientId="winRateAreaFill"
			domain={[0, 100]}
			valueFormatter={pctValue}
		/>
	);
}

// Hardest Answers

const hardestConfig = { value: { label: 'Win Rate', color: 'var(--secondary)' } } satisfies ChartConfig;

export function HardestPuzzlesChart({ data, previewCount }: { data: HardPuzzle[]; previewCount?: number }) {
	if (data.length === 0) return null;
	const bars: BarDatum[] = data.map((d, i) => ({
		label: d.player,
		value: d.winRate,
		rank: i + 1,
		tip: `#${i + 1} · ${d.winRate}% win rate · ${playerCount(d.played)}`,
	}));
	return (
		<BarChartCard
			title="Hardest Answers"
			data={bars}
			config={hardestConfig}
			labelWidth={88}
			previewCount={previewCount}
			domain={[0, 100]}
			valueFormatter={pctValue}
			searchPlaceholder="Search player…"
			showRank
		/>
	);
}
