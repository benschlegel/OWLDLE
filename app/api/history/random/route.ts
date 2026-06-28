import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { datasetSchema } from '@/data/datasets';
import { getRandomGame } from '@/lib/databaseAccess';

const rateLimiter = new RateLimiterMemory({ points: 60, duration: 60 });

export async function GET(request: NextRequest) {
	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
	try {
		await rateLimiter.consume(ip);
	} catch {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}

	// Optional dataset filter, if skipped or invalid, all datasets get used
	const datasetParam = request.nextUrl.searchParams.get('dataset');
	const parsed = datasetParam ? datasetSchema.safeParse(datasetParam) : null;
	const dataset = parsed?.success ? parsed.data : undefined;

	try {
		const game = await getRandomGame(dataset);
		if (!game) return new Response(JSON.stringify({ message: 'No games found' }), { status: 404 });
		// Not cached since random response has to be random.
		return Response.json(game, { headers: { 'Cache-Control': 'no-store' } });
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch a random game." }), { status: 500 });
	}
}
