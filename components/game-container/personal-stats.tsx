import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DatasetContext } from '@/context/DatasetContext';
import { GameStateContext } from '@/context/GameStateContext';
import { readablePlayerStats, usePlayerStatsStore } from '@/store/player-stats-store';
import { useContext } from 'react';

export default function PersonalStats() {
	const [dataset] = useContext(DatasetContext);
	const playerStatsStore = usePlayerStatsStore((s) => s.getStats(dataset.dataset));
	const playerStats = readablePlayerStats(playerStatsStore);
	const [gameState] = useContext(GameStateContext);

	// Only show stats once game is finished.
	const isFinished = gameState === 'won' || gameState === 'lost' || gameState === 'won-old' || gameState === 'lost-old';
	if (!isFinished) return null;

	return (
		<Card className="transition-colors animate-in fade-in duration-900">
			<CardHeader className="p-4 pb-2">
				<CardTitle className="text-lg font-owl">Your Stats</CardTitle>
				<Separator />
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
					<StatCell label="Games Played" value={playerStats.gamesPlayed} />
					<StatCell label="Games Won" value={playerStats.wins} />
					<StatCell label="Streak" value={playerStats.currentStreak} />
					<StatCell label="Best Streak" value={playerStats.highestStreak} />
					{playerStats.avgGuesses > 0 && <StatCell label="Avg Guesses" value={playerStats.avgGuesses} />}
					<StatCell label="Win Rate" value={`${playerStats.winRate}%`} />
				</div>
			</CardContent>
		</Card>
	);
}

function StatCell({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			<span className="text-muted-foreground tracking-wide">{label}</span>
		</div>
	);
}
