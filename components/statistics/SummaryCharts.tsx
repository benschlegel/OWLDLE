'use client';

import { Area, AreaChart, PolarAngleAxis, RadialBar, RadialBarChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import type { PerDayParams } from '@/components/statistics/PerDayChart';
import { rampStop } from '@/components/statistics/StatCharts';
import { usePerDay } from '@/hooks/use-per-day';

const ACCENT = 'var(--primary-foreground)';
const round1 = (v: number) => Math.round(v * 10) / 10;

const dayLabel = (date: string) => new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

function MiniTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number | null }[]; label?: string | number }) {
	if (!active || !payload?.length) return null;
	const value = payload[0]?.value;
	return (
		<div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<span className="text-muted-foreground">{dayLabel(String(label))}: </span>
			<span className="font-mono font-medium tabular-nums text-foreground">{value == null ? '—' : round1(Number(value)).toFixed(1)}</span>
			{value != null && <span className="text-muted-foreground"> / win</span>}
		</div>
	);
}

/**
 * Avg Guesses card — headline mean over the whole timeframe, with a small sparkline of the daily
 * average for the last ~8 days. Reuses the current-dataset per-day cache (same key as the chart).
 */
export function AvgGuessesCard({ params, averageGuesses }: { params: PerDayParams; averageGuesses: number | null }) {
	const { data } = usePerDay({ ...params, scope: 'current' });
	const last = (data?.perDay ?? []).slice(-8).map((p) => ({ date: p.date, value: p.wins > 0 ? round1(p.winGuessSum / p.wins) : null }));

	return (
		<Card className="flex flex-col">
			<CardHeader className="space-y-0 pb-1 pt-4">
				<CardDescription>Avg Guesses</CardDescription>
				<CardTitle className="flex items-baseline gap-1 font-owl text-3xl tabular-nums">
					{averageGuesses?.toFixed(1) ?? '—'}
					<span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">/ win</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-1 items-end p-0">
				<ChartContainer config={{ value: { label: 'Avg Guesses', color: ACCENT } }} className="aspect-auto h-full min-h-14 w-full">
					<AreaChart accessibilityLayer data={last} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
						<defs>
							<linearGradient id="avg-card-fill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={ACCENT} stopOpacity={0.5} />
								<stop offset="95%" stopColor={ACCENT} stopOpacity={0.08} />
							</linearGradient>
						</defs>
						<XAxis dataKey="date" hide />
						<YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
						<ChartTooltip cursor={false} content={<MiniTooltip />} />
						<Area dataKey="value" type="natural" fill="url(#avg-card-fill)" fillOpacity={0.4} stroke={ACCENT} strokeWidth={2} connectNulls dot={false} />
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

type RadialSummary = { gamesPlayed: number; wins: number; winRate: number };
type RadialDatum = { key: string; value: number; fill: string; label: string; display: string };

function RadialTooltip({ active, payload }: { active?: boolean; payload?: { payload?: RadialDatum }[] }) {
	if (!active || !payload?.length) return null;
	const d = payload[0]?.payload;
	if (!d) return null;
	return (
		<div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: d.fill }} />
			<span className="text-muted-foreground">{d.label}</span>
			<span className="font-mono font-medium tabular-nums text-foreground">{d.display}</span>
		</div>
	);
}

/**
 * Games / Wins / Win-rate card — totals on the left, a 3-ring radial on the right. Rings run
 * outer→inner as Games Played (accent, full ring) → Games Won → Win Rate, the inner two reusing the
 * 2nd/3rd bar-chart ramp colours. Each ring fills its real percentage (win rate fills win-rate %).
 */
export function GamesRadialCard({ summary }: { summary: RadialSummary }) {
	const wonShare = summary.gamesPlayed > 0 ? Math.round((summary.wins / summary.gamesPlayed) * 100) : 0;
	// Array order is inner → outer: Games Played (inner) → Games Won → Win Rate (outer, accent).
	const data: RadialDatum[] = [
		{ key: 'played', value: 100, fill: rampStop(4 / 6), label: 'Games Played', display: summary.gamesPlayed.toLocaleString() },
		{ key: 'won', value: wonShare, fill: rampStop(2 / 6), label: 'Games Won', display: summary.wins.toLocaleString() },
		{ key: 'winRate', value: summary.winRate, fill: ACCENT, label: 'Win Rate', display: `${summary.winRate}%` },
	];

	const stats: { label: string; value: string; unit?: string }[] = [
		{ label: 'Games Played', value: summary.gamesPlayed.toLocaleString() },
		{ label: 'Games Won', value: summary.wins.toLocaleString() },
		{ label: 'Win Rate', value: String(summary.winRate), unit: '%' },
	];

	return (
		<Card className="flex flex-col">
			<CardContent className="flex flex-1 items-center gap-4 p-4">
				<div className="grid flex-1 items-center gap-2.5">
					{stats.map((s) => (
						<div key={s.label} className="grid auto-rows-min gap-0.5">
							<div className="text-xs text-muted-foreground">{s.label}</div>
							<div className="flex items-baseline gap-1 font-owl text-2xl tabular-nums leading-none text-primary-foreground">
								{s.value}
								{s.unit && <span className="font-sans text-sm font-normal text-muted-foreground">{s.unit}</span>}
							</div>
						</div>
					))}
				</div>
				<ChartContainer
					config={{ played: { label: 'Games Played' }, won: { label: 'Games Won' }, winRate: { label: 'Win Rate' } }}
					className="aspect-square h-40 w-40 shrink-0">
					<RadialBarChart data={data} innerRadius="30%" outerRadius="100%" barCategoryGap={3} startAngle={90} endAngle={450} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
						<PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false} />
						<ChartTooltip cursor={false} content={<RadialTooltip />} />
						<RadialBar dataKey="value" background cornerRadius={4} />
					</RadialBarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
