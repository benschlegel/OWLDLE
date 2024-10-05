import type { SeasonStat, WinPercentage, PlayerOccurance } from '@/lib/databaseAccess';

export type StatsRes = {
	total: number;
	seasons: SeasonStat[];
	winPercent: WinPercentage[];
	playerStats: PlayerOccurance[];
};
