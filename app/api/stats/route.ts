import { countGames, goNextIteration } from '@/lib/databaseAccess';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	const total = await countGames();

	const res = { total: total };
	return new Response(JSON.stringify(res), { status: 200 });
}
