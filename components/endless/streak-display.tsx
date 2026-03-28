import { Flame, MedalIcon, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

type StatsDisplay = {
	currentStreak: number;
	highestStreak: number;
	wins: number;
	games: number;
};

export function StreakDisplay({ stats }: { stats: StatsDisplay }) {
	return (
		<div className="w-full rounded-lg sm:h-[3.7rem] h-[3.1rem] bg-card -mt-4 mb-2 flex items-center justify-between px-8">
			<Cell label="streak" value={stats.currentStreak} icon={<Flame className="sm:size-4 size-3.5 text-primary-foreground" />} />
			<Cell label="best" value={stats.highestStreak} icon={<Trophy className="sm:size-4 size-3.5 text-yellow-500" />} />
			<Cell label="wins" value={`${stats.wins}/${stats.games}`} icon={<MedalIcon className="sm:size-4 size-3.5 text-green-700" />} />
		</div>
		// <div className="flex gap-4 justify-center mb-3 text-sm font-mono">
		// 	<div className="flex items-center gap-1.5">
		// 		<Flame className="size-4 text-orange-500" />
		// 		<span className="font-semibold">{stats.currentStreak}</span>
		// 		<span className="text-muted-foreground">streak</span>
		// 	</div>
		// 	<div className="flex items-center gap-1.5">
		// 		<Trophy className="size-4 text-yellow-500" />
		// 		<span className="font-semibold">{stats.highestStreak}</span>
		// 		<span className="text-muted-foreground">best</span>
		// 	</div>
		// 	<div className="flex items-center gap-1.5">
		// 		<span className="font-semibold">
		// 			{stats.wins}/{stats.games}
		// 		</span>
		// 		<span className="text-muted-foreground">wins</span>
		// 	</div>
		// </div>
	);
}

type CellProps = {
	label: string;
	icon?: ReactNode;
	value?: number | string;
};
function Cell({ label, value, icon }: CellProps) {
	return (
		<div className="flex flex-col">
			<div className="flex gap-1 items-center">
				{icon}
				<span className="text-sm font-owl">{label}</span>
			</div>
			<span className="font-mono text-sm text-center text-muted-foreground">{value}</span>
		</div>
	);
}
