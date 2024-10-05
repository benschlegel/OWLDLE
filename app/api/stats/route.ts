import { type Dataset, DATASETS } from '@/data/datasets';
import { countGamesByDataset, countPlayers, countTotalGames, getWinPercentages } from '@/lib/databaseAccess';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	const total = await countTotalGames();

	const seasonStats = await countGamesByDataset();

	const winPercent = await getWinPercentages();
	const playerStats = await countPlayers();

	const res = { total, seasons: seasonStats, winPercent, playerStats };
	return new Response(JSON.stringify(res), { status: 200 });
}
