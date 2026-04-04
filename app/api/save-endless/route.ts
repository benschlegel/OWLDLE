import type { NextRequest } from 'next/server';
import { logEndlessSession } from '@/lib/databaseAccess';
import { endlessSaveValidator } from '@/types/database';
import { datasetSchema } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
export const dynamic = 'force-dynamic';

// Minimum average seconds per game to consider timestamps plausible
const MIN_AVG_SECONDS_PER_GAME = 4;

// in-memory rate limiter (per IP, 5s cooldown)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5_000;

function getClientIp(request: NextRequest): string {
	return request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const last = rateLimitMap.get(ip);
	if (last && now - last < RATE_LIMIT_MS) return false;
	rateLimitMap.set(ip, now);
	// Prune stale entries periodically
	if (rateLimitMap.size > 10_000) {
		for (const [key, ts] of rateLimitMap) {
			if (now - ts > RATE_LIMIT_MS * 2) rateLimitMap.delete(key);
		}
	}
	return true;
}

export async function POST(request: NextRequest) {
	// Rate limit
	const ip = getClientIp(request);
	if (!checkRateLimit(ip)) {
		return new Response('Too many requests. Please wait a few seconds.', { status: 429 });
	}

	const parsedBody = await request.json();
	const saveRes = endlessSaveValidator.safeParse(parsedBody);

	if (!saveRes.success) {
		const errMessage = saveRes.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	const searchParams = request.nextUrl.searchParams;
	const dataset = searchParams.get('dataset') ?? 'season1';
	const datasetParsed = datasetSchema.safeParse(dataset);

	if (!datasetParsed.success) {
		const errMessage = datasetParsed.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid dataset. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	const { streakLength, games, filters, name, clientId, anonymous } = saveRes.data;

	// structural validation: games must have streakLength wins + 1 loss
	if (games.length !== streakLength + 1) {
		return new Response('Invalid games array length.', { status: 400 });
	}
	for (let i = 0; i < games.length - 1; i++) {
		if (games[i].result !== 'won') {
			return new Response('Invalid game sequence.', { status: 400 });
		}
	}
	if (games[games.length - 1].result !== 'lost') {
		return new Response('Invalid game sequence.', { status: 400 });
	}
	// Each guessCount must be 1..maxGuesses
	for (const game of games) {
		if (game.guessCount < 1 || game.guessCount > GAME_CONFIG.maxGuesses) {
			return new Response(`Invalid guessCount.`, { status: 400 });
		}
	}

	// Anti-abuse timestamp validation
	const timestamps = games.map((g) => g.completedAt);
	// Must be chronologically ordered
	for (let i = 1; i < timestamps.length; i++) {
		if (timestamps[i] <= timestamps[i - 1]) {
			return new Response('Invalid games.', { status: 400 });
		}
	}
	// Total duration must average at least MIN_AVG_SECONDS_PER_GAME per game
	const totalDurationMs = timestamps[timestamps.length - 1] - timestamps[0];
	// For single-game sessions (streak=0 loss), skip duration check
	if (games.length > 1) {
		const requiredMs = (games.length - 1) * MIN_AVG_SECONDS_PER_GAME * 1000;
		if (totalDurationMs < requiredMs) {
			return new Response('Invalid games.', { status: 400 });
		}
	}
	// Last timestamp can't be in the future (30s tolerance)
	const serverNow = Date.now();
	if (timestamps[timestamps.length - 1] > serverNow + 30_000) {
		return new Response('Invalid games.', { status: 400 });
	}

	// clientId required for any leaderboard entry (named or anonymous); name only allowed with clientId
	if ((name && !clientId) || (anonymous && !clientId)) {
		return new Response('clientId is required for leaderboard entries.', { status: 400 });
	}

	try {
		const res = await logEndlessSession(datasetParsed.data, streakLength, games, filters, name, clientId, anonymous);
		if (res.acknowledged) {
			return new Response(undefined, { status: 200 });
		}
	} catch (e) {
		return new Response(JSON.stringify({ message: "Couldn't save endless session." }), { status: 500 });
	}

	return new Response(JSON.stringify({ message: "Couldn't save endless session." }), { status: 500 });
}
