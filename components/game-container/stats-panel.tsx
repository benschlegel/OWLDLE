'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStats, type GameStatsData } from '@/hooks/use-game-stats';
import { usePlayerStatsStore, readablePlayerStats } from '@/store/player-stats-store';
import { GAME_CONFIG } from '@/lib/config';
import { useContext } from 'react';
import { GameStateContext } from '@/context/GameStateContext';
import { DatasetContext } from '@/context/DatasetContext';
import { useEvaluatedGuesses } from '@/context/GlobalGuessContext';
import { useAnswerQuery } from '@/hooks/use-answer-query';

export default function StatsPanel() {
	const [gameState] = useContext(GameStateContext);
	const [dataset] = useContext(DatasetContext);
	const { data: validatedData } = useAnswerQuery(dataset.dataset);
	const { data: guessData } = useEvaluatedGuesses(dataset.dataset, validatedData?.nextReset);
	const { data: globalStats } = useGameStats(dataset.dataset);
	const playerStats = usePlayerStatsStore((s) => s.getStats(dataset.dataset));
	const readable = readablePlayerStats(playerStats);

	const isFinished = gameState === 'won' || gameState === 'lost' || gameState === 'won-old' || gameState === 'lost-old';
	if (!isFinished) return null;

	const playerGuessCount = guessData.evaluatedGuesses.length;
	const didWin = gameState === 'won' || gameState === 'won-old';

	return (
		<div className="flex flex-col gap-3">
			{/* Player stats */}
			<Card className="transition-colors">
				<CardHeader className="p-4 pb-2">
					<CardTitle className="text-base">Your Stats</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
						<StatLine label="Played" value={readable.gamesPlayed} />
						<StatLine label="Win Rate" value={`${readable.winRate}%`} />
						<StatLine label="Streak" value={readable.currentStreak} />
						<StatLine label="Best" value={readable.highestStreak} />
						{readable.avgGuesses > 0 && <StatLine label="Avg Guesses" value={readable.avgGuesses} />}
					</div>
				</CardContent>
			</Card>

			{/* Global stats */}
			{globalStats && (
				<Card className="transition-colors">
					<CardHeader className="p-4 pb-2">
						<CardTitle className="text-base">Global Stats</CardTitle>
					</CardHeader>
					<CardContent className="p-4 pt-0">
						<GlobalSummary stats={globalStats} />
						<div className="mt-3">
							<p className="text-xs text-muted-foreground mb-1.5">Guess Distribution</p>
							<GuessDistribution
								stats={globalStats}
								playerGuessCount={playerGuessCount}
								didWin={didWin}
							/>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function StatLine({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex justify-between">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-bold">{value}</span>
		</div>
	);
}

function GlobalSummary({ stats }: { stats: GameStatsData }) {
	const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
	return (
		<div className="grid grid-cols-3 gap-2 text-center">
			<div>
				<p className="text-lg font-bold">{stats.totalGames}</p>
				<p className="text-xs text-muted-foreground">Played</p>
			</div>
			<div>
				<p className="text-lg font-bold">{winRate}%</p>
				<p className="text-xs text-muted-foreground">Win Rate</p>
			</div>
			<div>
				<p className="text-lg font-bold">{stats.wins}</p>
				<p className="text-xs text-muted-foreground">Wins</p>
			</div>
		</div>
	);
}

function GuessDistribution({
	stats,
	playerGuessCount,
	didWin,
}: { stats: GameStatsData; playerGuessCount: number; didWin: boolean }) {
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
								isPlayerRow
									? 'bg-correct text-white font-bold'
									: 'bg-muted text-muted-foreground'
							}`}
							style={{ width: `${widthPercent}%`, minWidth: 'fit-content' }}
						>
							{count}
						</div>
					</div>
				);
			})}
		</div>
	);
}
