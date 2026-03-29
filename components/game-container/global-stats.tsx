'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStats, type GameStatsData } from '@/hooks/use-game-stats';
import { GAME_CONFIG } from '@/lib/config';
import { useContext } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import { DatasetContext } from '@/context/DatasetContext';
import { useEvaluatedGuesses } from '@/context/GlobalGuessContext';
import { useAnswerQuery } from '@/hooks/use-answer-query';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/store/settings-store';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts';

export default function GlobalStats() {
	const [gameState] = useContext(GameStateContext);
	const [dataset] = useContext(DatasetContext);
	const { data: validatedData } = useAnswerQuery(dataset.dataset);
	const { data: guessData } = useEvaluatedGuesses(dataset.dataset, validatedData?.nextReset);
	const { data: globalStats } = useGameStats(dataset.dataset);
	const areStatsVisible = useSettings((s) => s.areStatsVisible);

	const isFinished = gameState === 'won' || gameState === 'lost' || gameState === 'won-old' || gameState === 'lost-old';
	if (!isFinished || !areStatsVisible) return null;

	const playerGuessCount = guessData.evaluatedGuesses.length;
	const didWin = gameState === 'won' || gameState === 'won-old';

	return (
		<div className="flex flex-col gap-3 animate-in fade-in duration-900">
			{/* Global stats */}
			{globalStats && (
				<Card className="transition-colors">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-lg font-owl">Global Stats</CardTitle>
						<Separator />
					</CardHeader>
					<CardContent className="p-4 pt-0">
						<GlobalSummary stats={globalStats} />
						<div className="mt-3">
							<p className="text-lg text-foreground/90 mb-1.5 font-owl text-center">Guess Distribution</p>
							<GuessDistribution stats={globalStats} playerGuessCount={playerGuessCount} didWin={didWin} />
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function StatCell({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			<span className="text-muted-foreground text-sm tracking-wide">{label}</span>
		</div>
	);
}

function GlobalSummary({ stats }: { stats: GameStatsData }) {
	const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
	return (
		<div className="grid grid-cols-3 gap-2 text-center">
			<StatCell label="Played" value={stats.totalGames} />
			<StatCell label="Win Rate" value={`${winRate}%`} />
			<StatCell label="Wins" value={stats.wins} />
		</div>
	);
}

function GuessDistribution({
	stats,
	playerGuessCount,
	didWin,
}: {
	stats: GameStatsData;
	playerGuessCount: number;
	didWin: boolean;
}) {
	const distribution = stats.guessDistribution;

	// Build keys
	const keys: string[] = [];
	for (let i = 1; i <= GAME_CONFIG.maxGuesses; i++) {
		keys.push(String(i));
	}
	keys.push('failed');

	const chartData = keys.map((key) => {
		const count = distribution[key] ?? 0;
		const percentage = stats.totalGames > 0 ? (count / stats.totalGames) * 100 : 0;

		const isPlayerRow = didWin ? key === String(playerGuessCount) : key === 'failed';
		const label = key === 'failed' ? 'failed' : key;

		return {
			key,
			label,
			value: count, // absolute count (used in tooltip)
			percentage, // percentage (used in right label)
			isPlayerRow,
		};
	});

	const chartConfig = {
		value: {
			label: 'Guesses',
			color: 'var(--secondary)',
		},
		label: {
			color: 'var(--background)',
		},
	} satisfies ChartConfig;

	return (
		<ChartContainer config={chartConfig} className="h-54 w-full ">
			<BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ right: 24 }}>
				<CartesianGrid horizontal={false} />

				<YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={10} width={50} />

				<XAxis type="number" hide />

				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							indicator="line"
							formatter={(_, __, item) => {
								const raw = item?.payload?.value ?? 0;
								if (raw === 1) return '1 Player';
								return `${raw} Players`;
							}}
						/>
					}
				/>

				<Bar dataKey="percentage" radius={4} minPointSize={8}>
					{/* Custom coloring per row */}
					{chartData.map((entry, index) => (
						<Cell
							// biome-ignore lint/suspicious/noArrayIndexKey: only thing available
							key={index}
							className={entry.isPlayerRow ? 'fill-primary-foreground' : 'fill-secondary'}
						/>
					))}

					{/* Left label (inside bar) */}
					{/* <LabelList dataKey="label" position="insideLeft" offset={8} className="fill-foreground text-xs" /> */}

					{/* Value on the right */}
					<LabelList
						dataKey="percentage"
						position="right"
						offset={8}
						className="fill-foreground text-xs"
						formatter={(value: unknown) => `${Math.round(Number(value ?? 0))}%`}
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
