import { Flame, Trophy } from 'lucide-react';

type StatsDisplay = {
	currentStreak: number;
	highestStreak: number;
	wins: number;
	games: number;
};

export function StreakDisplay({ stats }: { stats: StatsDisplay }) {
	return (
		<div className="flex gap-4 justify-center mb-3 text-sm font-mono">
			<div className="flex items-center gap-1.5">
				<Flame className="size-4 text-orange-500" />
				<span className="font-semibold">{stats.currentStreak}</span>
				<span className="text-muted-foreground">streak</span>
			</div>
			<div className="flex items-center gap-1.5">
				<Trophy className="size-4 text-yellow-500" />
				<span className="font-semibold">{stats.highestStreak}</span>
				<span className="text-muted-foreground">best</span>
			</div>
			<div className="flex items-center gap-1.5">
				<span className="font-semibold">
					{stats.wins}/{stats.games}
				</span>
				<span className="text-muted-foreground">wins</span>
			</div>
		</div>
	);
}
