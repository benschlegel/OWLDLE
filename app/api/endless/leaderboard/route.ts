import type { NextRequest } from 'next/server';
import { getLeaderboard, getLeaderboardRank, updateLeaderboardName } from '@/lib/databaseAccess';
import { datasetSchema } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { leaderboardNameSchema } from '@/types/database';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

// in-memory rate limiter (per IP, 10s cooldown for renames)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 10_000;

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

const nameUpdateSchema = z.object({
	clientId: z.string().uuid(),
	name: leaderboardNameSchema,
});

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;

	const dataset = params.get('dataset') ?? 'season1';
	const datasetParsed = datasetSchema.safeParse(dataset);
	if (!datasetParsed.success) {
		return Response.json({ error: 'Invalid dataset.' }, { status: 400 });
	}

	const page = Math.max(1, Number(params.get('page') ?? 1));
	const limit = Math.min(100, Math.max(1, Number(params.get('limit') ?? GAME_CONFIG.leaderboardPageSize)));

	// Optional filters (for latest season)
	const regionParam = params.get('region');
	const partnerParam = params.get('partnerOnly');
	let filters: { region: number; isPartnerOnly: boolean } | undefined;
	if (regionParam != null && partnerParam != null) {
		const region = Number(regionParam);
		if (!Number.isInteger(region) || region < 0) {
			return Response.json({ error: 'Invalid region.' }, { status: 400 });
		}
		filters = { region, isPartnerOnly: partnerParam === 'true' };
	}

	// find rank of a specific clientId (used for "go to me" button)
	const findClientId = params.get('findClientId');
	let myRank: number | null = null;
	if (findClientId) {
		myRank = await getLeaderboardRank(datasetParsed.data, findClientId, GAME_CONFIG.leaderboardMaxEntries, filters);
	}

	const result = await getLeaderboard(datasetParsed.data, page, limit, GAME_CONFIG.leaderboardMaxEntries, filters);

	return Response.json({
		entries: result.entries,
		total: result.total,
		page,
		limit,
		...(myRank !== null && { myRank }),
	});
}

// Update display name across all leaderboard entries for a clientId (rename function)
export async function PATCH(request: NextRequest) {
	// Rate limit
	const ip = getClientIp(request);
	if (!checkRateLimit(ip)) {
		return new Response('Too many requests.', { status: 429 });
	}

	const body = await request.json();
	const parsed = nameUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: 'Invalid input.' }, { status: 400 });
	}

	const { clientId, name } = parsed.data;
	const result = await updateLeaderboardName(clientId, name);

	return Response.json({ updated: result.modifiedCount });
}
