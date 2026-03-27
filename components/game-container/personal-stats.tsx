import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatasetContext } from '@/context/DatasetContext';
import { readablePlayerStats, usePlayerStatsStore } from '@/store/player-stats-store';
import { useContext } from 'react';

export default function PersonalStats() {
	const [dataset] = useContext(DatasetContext);
	const playerStats = usePlayerStatsStore((s) => s.getStats(dataset.dataset));
	const readable = readablePlayerStats(playerStats);
	return (
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
