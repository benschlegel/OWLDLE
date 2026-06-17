import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { NextRequest } from 'next/server';
import { logGame, updateGameStats, getCurrentIteration } from '@/lib/databaseAccess';
import { gameSaveValidator } from '@/types/database';
import { datasetSchema } from '@/data/datasets';
export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiterMemory({
	points: 60, // Number of requests
	duration: 60, // Per 1 second
});

export async function POST(request: NextRequest) {
	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
	try {
		await rateLimiter.consume(ip);
	} catch {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}

	// Try to parse request
	const parsedBody = await request.json();
	const gameSaveRes = gameSaveValidator.safeParse(parsedBody);

	// Error handling
	if (!gameSaveRes.success) {
		const errMessage = gameSaveRes.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	const searchParams = request.nextUrl.searchParams;
	const dataset = searchParams.get('dataset') ?? 'season1';
	// Get query parameter
	const datasetParsed = datasetSchema.safeParse(dataset);

	// Error handling
	if (!datasetParsed.success) {
		const errMessage = datasetParsed.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid dataset. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	// Raw data
	const playerGuesses = gameSaveRes.data.gameData;

	try {
		// Try to log game, return with success code if so
		const timestamp = new Date();
		const res = await logGame(playerGuesses, gameSaveRes.data.gameResult, timestamp, datasetParsed.data);
		if (res?.acknowledged) {
			// Update game stats atomically
			const iteration = await getCurrentIteration(datasetParsed.data);
			if (iteration) {
				const guessCount = gameSaveRes.data.gameData.length;
				const updatedStats = await updateGameStats(datasetParsed.data, iteration, gameSaveRes.data.gameResult, guessCount);
				if (updatedStats) {
					const { _id, ...stats } = updatedStats;
					return Response.json({ stats, isFirstWin: gameSaveRes.data.gameResult === 'won' && stats.wins === 1 });
				}
			}
			// Stats update failed but game was saved, still return 200
			return new Response(undefined, { status: 200 });
		}
	} catch (e) {
		return new Response(JSON.stringify({ message: "Couldn't save game." }), { status: 500 });
	}

	return new Response(JSON.stringify({ message: "Couldn't save game." }), { status: 500 });
}
