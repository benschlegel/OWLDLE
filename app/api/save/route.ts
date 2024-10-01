import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { NextRequest } from 'next/server';
import { logGame } from '@/lib/databaseAccess';
import { gameSaveValidator } from '@/types/database';
export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiterMemory({
	points: 60, // Number of requests
	duration: 60, // Per 1 second
});

export async function POST(request: NextRequest) {
	// Apply rate limiter
	try {
		await rateLimiter.consume(request.ip ?? 'anonymous');

		// Try to parse request
		const parsedBody = await request.json();
		const gameSaveRes = gameSaveValidator.safeParse(parsedBody);

		// Error handling
		if (!gameSaveRes.success) {
			const errMessage = gameSaveRes.error.errors.map((err) => `${err.path}: ${err.message},`);
			return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
		}

		// Raw data
		const playerGuesses = gameSaveRes.data.gameData;

		try {
			// Try to log game, return with success code if so
			const timestamp = new Date();
			const res = await logGame(playerGuesses, gameSaveRes.data.gameResult, timestamp, 'season1');
			if (res?.acknowledged) {
				return new Response(undefined, { status: 200 });
			}
		} catch (e) {
			return new Response(JSON.stringify({ message: "Couldn't save game." }), { status: 500 });
		}

		return new Response(JSON.stringify({ message: "Couldn't save game." }), { status: 500 });
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}
}
