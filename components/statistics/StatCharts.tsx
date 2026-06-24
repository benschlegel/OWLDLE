'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import type { DayPoint, GuessBucket, HardPuzzle, NamedCount, TeamCount } from '@/types/statistics';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

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
		{ label: 'Avg Guesses', value: summary.averageGuesses?.toFixed(1) ?? '-' },
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

function StatChartCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="p-4 pb-2">
				<CardTitle className="text-lg font-owl">{title}</CardTitle>
				<Separator />
			</CardHeader>
			<CardContent className="p-4 pt-2">{children}</CardContent>
		</Card>
	);
}

// Guess Distribution

const guessDistConfig = { pct: { label: 'Share', color: 'var(--secondary)' } } satisfies ChartConfig;

export function GuessDistributionChart({ data }: { data: GuessBucket[] }) {
	const isMobile = useIsMobile();
	if (data.length === 0) return null;
	const total = data.reduce((sum, d) => sum + d.count, 0);
	const chartData = data.map((d) => ({
		...d,
		pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
	}));
	const chartHeight = data.length * 40 + 16;
	return (
		<StatChartCard title="Guess Distribution">
			<ChartContainer config={guessDistConfig} style={{ height: chartHeight }} className={`w-full ${isMobile ? '**:outline-none!' : ''}`}>
				<BarChart accessibilityLayer={!isMobile} data={chartData} layout="vertical" margin={{ right: 48, left: 4 }}>
					<CartesianGrid horizontal={false} />
					<YAxis dataKey="bucket" type="category" tickLine={false} axisLine={false} tickMargin={8} width={50} />
					<XAxis type="number" hide />
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								indicator="line"
								formatter={(_, __, item) => {
									const { count } = item.payload as { count: number };
									return `${count} ${count === 1 ? 'player' : 'players'}`;
								}}
							/>
						}
					/>
					<Bar dataKey="pct" radius={4} className="fill-secondary">
						<LabelList dataKey="pct" position="right" offset={8} className="fill-foreground text-xs" formatter={(v: unknown) => `${v}%`} />
					</Bar>
				</BarChart>
			</ChartContainer>
		</StatChartCard>
	);
}

// Most Popular First Guess

const firstGuessConfig = { count: { label: 'Players', color: 'var(--secondary)' } } satisfies ChartConfig;

export function FirstGuessChart({ data }: { data: NamedCount[] }) {
	const isMobile = useIsMobile();
	if (data.length === 0) return null;
	const chartHeight = data.length * 40 + 16;
	return (
		<StatChartCard title="Most Popular First Guess">
			<ChartContainer config={firstGuessConfig} style={{ height: chartHeight }} className={`w-full ${isMobile ? '**:outline-none!' : ''}`}>
				<BarChart accessibilityLayer={!isMobile} data={data} layout="vertical" margin={{ right: 48, left: 4 }}>
					<CartesianGrid horizontal={false} />
					<YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={88} />
					<XAxis type="number" hide />
					<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
					<Bar dataKey="count" radius={4} className="fill-secondary">
						<LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
					</Bar>
				</BarChart>
			</ChartContainer>
		</StatChartCard>
	);
}

// Most Popular First Team

const firstTeamConfig = { count: { label: 'Players', color: 'var(--secondary)' } } satisfies ChartConfig;

export function FirstTeamChart({ data }: { data: TeamCount[] }) {
	const isMobile = useIsMobile();
	if (data.length === 0) return null;
	const chartHeight = data.length * 40 + 16;
	return (
		<StatChartCard title="Most Popular First Team">
			<ChartContainer config={firstTeamConfig} style={{ height: chartHeight }} className={`w-full ${isMobile ? '**:outline-none!' : ''}`}>
				<BarChart accessibilityLayer={!isMobile} data={data} layout="vertical" margin={{ right: 48, left: 4 }}>
					<CartesianGrid horizontal={false} />
					<YAxis dataKey="team" type="category" tickLine={false} axisLine={false} tickMargin={8} width={88} />
					<XAxis type="number" hide />
					<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
					<Bar dataKey="count" radius={4} className="fill-secondary">
						<LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
					</Bar>
				</BarChart>
			</ChartContainer>
		</StatChartCard>
	);
}

// Games Played Per Day

const gamesPerDayConfig = { played: { label: 'Games', color: 'var(--primary-foreground)' } } satisfies ChartConfig;

export function GamesPerDayChart({ data }: { data: DayPoint[] }) {
	const isMobile = useIsMobile();
	if (data.length === 0) return null;
	return (
		<StatChartCard title="Games Played Per Day">
			<ChartContainer config={gamesPerDayConfig} className={`h-56 w-full ${isMobile ? '**:outline-none!' : ''}`}>
				<AreaChart accessibilityLayer={!isMobile} data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="gamesAreaFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--primary-foreground)" stopOpacity={0.25} />
							<stop offset="95%" stopColor="var(--primary-foreground)" stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<CartesianGrid vertical={false} />
					<XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
					<YAxis tickLine={false} axisLine={false} tickMargin={4} width={36} />
					<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
					<Area dataKey="played" type="monotone" stroke="var(--primary-foreground)" strokeWidth={2} fill="url(#gamesAreaFill)" />
				</AreaChart>
			</ChartContainer>
		</StatChartCard>
	);
}

// Win Rate Per Day

const winRateConfig = { winRate: { label: 'Win Rate', color: 'var(--primary-foreground)' } } satisfies ChartConfig;

export function WinRatePerDayChart({ data }: { data: DayPoint[] }) {
	const isMobile = useIsMobile();
	if (data.length === 0) return null;
	return (
		<StatChartCard title="Win Rate Per Day">
			<ChartContainer config={winRateConfig} className={`h-56 w-full ${isMobile ? '**:outline-none!' : ''}`}>
				<AreaChart accessibilityLayer={!isMobile} data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="winRateAreaFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--primary-foreground)" stopOpacity={0.25} />
							<stop offset="95%" stopColor="var(--primary-foreground)" stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<CartesianGrid vertical={false} />
					<XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
					<YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={4} width={40} tickFormatter={(v) => `${v}%`} />
					<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(value) => `${value}%`} />} />
					<Area dataKey="winRate" type="monotone" stroke="var(--primary-foreground)" strokeWidth={2} fill="url(#winRateAreaFill)" />
				</AreaChart>
			</ChartContainer>
		</StatChartCard>
	);
}

// Hardest Puzzles

const hardestConfig = { winRate: { label: 'Win Rate', color: 'var(--secondary)' } } satisfies ChartConfig;

export function HardestPuzzlesChart({ data }: { data: HardPuzzle[] }) {
	const isMobile = useIsMobile();
	if (data.length === 0) return null;
	const chartHeight = data.length * 40 + 16;
	return (
		<StatChartCard title="Hardest Puzzles">
			<ChartContainer config={hardestConfig} style={{ height: chartHeight }} className={`w-full ${isMobile ? '**:outline-none!' : ''}`}>
				<BarChart accessibilityLayer={!isMobile} data={data} layout="vertical" margin={{ right: 56, left: 4 }}>
					<CartesianGrid horizontal={false} />
					<YAxis dataKey="player" type="category" tickLine={false} axisLine={false} tickMargin={8} width={88} />
					<XAxis type="number" domain={[0, 100]} hide />
					<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
					<Bar dataKey="winRate" radius={4} className="fill-secondary">
						<LabelList dataKey="winRate" position="right" offset={8} className="fill-foreground text-xs" formatter={(v: unknown) => `${v}%`} />
					</Bar>
				</BarChart>
			</ChartContainer>
		</StatChartCard>
	);
}
