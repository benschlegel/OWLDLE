import { RateLimiterMemory } from 'rate-limiter-flexible';
import { trimDate } from '@/lib/utils';
import type { NextRequest } from 'next/server';
import { logGame } from '@/lib/databaseAccess';
import { type DbGuess, gameSaveValidator } from '@/types/database';
export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiterMemory({
	points: 2, // Number of requests
	duration: 1, // Per 1 second
});

export async function POST(request: NextRequest) {
	// Apply rate limiter
	try {
		await rateLimiter.consume(request.ip ?? 'anonymous');

		// TODO: get current iteration from db
		// Try to parse request
		const parsedBody = await request.json();
		const gameSaveRes = gameSaveValidator.safeParse(parsedBody);

		// Error handling
		if (!gameSaveRes.success) {
			const errMessage = gameSaveRes.error.errors.map((err) => `${err.path}: ${err.message},`);
			return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
		}

		// Raw data
		const playerGuesses = gameSaveRes.data as DbGuess[];

		try {
			await logGame([], 0);
		} catch (e) {
			return new Response(JSON.stringify({ message: "Couldn't save game." }), { status: 500 });
		}
		// await deleteAllPlayers();

		return new Response(undefined, { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}
}
