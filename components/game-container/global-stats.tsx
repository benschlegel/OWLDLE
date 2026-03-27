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
							<p className="text-xs text-muted-foreground mb-1.5">Guess Distribution</p>
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

function GuessDistribution({ stats, playerGuessCount, didWin }: { stats: GameStatsData; playerGuessCount: number; didWin: boolean }) {
	const distribution = stats.guessDistribution;

	// Build rows: 1 through maxGuesses + "failed"
	const keys: string[] = [];
	for (let i = 1; i <= GAME_CONFIG.maxGuesses; i++) {
		keys.push(String(i));
	}
	keys.push('failed');

	const maxCount = Math.max(1, ...keys.map((k) => distribution[k] ?? 0));

	return (
		<div className="flex flex-col gap-1">
			{keys.map((key) => {
				const count = distribution[key] ?? 0;
				const widthPercent = Math.max(8, (count / maxCount) * 100);
				const isPlayerRow = didWin ? key === String(playerGuessCount) : key === 'failed';
				const label = key === 'failed' ? 'X' : key;

				return (
					<div key={key} className="flex items-center gap-1.5 text-xs">
						<span className="w-3 text-right font-mono text-muted-foreground shrink-0">{label}</span>
						<div
							className={`rounded-sm px-1.5 py-0.5 text-right font-mono text-[11px] leading-tight transition-colors ${
								isPlayerRow ? 'bg-correct text-white font-bold' : 'bg-muted text-muted-foreground'
							}`}
							style={{ width: `${widthPercent}%`, minWidth: 'fit-content' }}>
							{count}
						</div>
					</div>
				);
			})}
		</div>
	);
}
