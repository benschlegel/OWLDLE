import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { getGlobalGamesPlayed } from '@/lib/databaseAccess';

// Total games played all-time. This endpoint is intentionally never cached (estimateDocumentCount is cheap).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const rateLimiter = new RateLimiterMemory({ points: 60, duration: 60 });

// const TEMP_TEST_START = Date.now();
// const tempTestOffset = () => Math.floor((Date.now() - TEMP_TEST_START) / 2000); // +1 every 2s

export async function GET(request: NextRequest) {
	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
	try {
		await rateLimiter.consume(ip);
	} catch {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}

	try {
		const totalGames = await getGlobalGamesPlayed();
		// add + tempTestOffset() for testing
		return Response.json({ totalGames: totalGames }, { headers: { 'Cache-Control': 'no-store' } });
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch global games." }), { status: 500 });
	}
}
