import { type Dataset, DATASETS } from '@/data/datasets';
import { countGames, getWinPercentages } from '@/lib/databaseAccess';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SeasonStat = { dataset: Dataset; count: number };

export async function GET(request: Request) {
	const total = await countGames();

	const seasonStats: SeasonStat[] = [];
	for (const dataset of DATASETS) {
		const count = await countGames(dataset);
		seasonStats.push({ dataset, count });
	}

	const winPercent = await getWinPercentages();

	const res = { total: total, seasons: seasonStats, winPercent: winPercent };
	return new Response(JSON.stringify(res), { status: 200 });
}
