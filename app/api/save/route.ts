import { RateLimiterMemory } from 'rate-limiter-flexible';
import { trimDate } from '@/lib/utils';
import type { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiterMemory({
	points: 2, // Number of requests
	duration: 60, // Per 60 seconds
});

export async function GET(request: NextRequest) {
	// Apply rate limiter
	try {
		await rateLimiter.consume(request.ip ?? 'anonymous');

		// Not rate limited, handle response
		const currDate = new Date();
		let isProd = false;
		if (process.env.NODE_ENV !== 'production') {
			isProd = true;
		}

		const trimmedDate = trimDate(currDate, isProd);
		// await deleteAllPlayers();

		return new Response(JSON.stringify({ currDate: trimmedDate }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}
}
