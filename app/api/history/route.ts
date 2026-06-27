import { unstable_cache } from 'next/cache';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Dataset } from '@/data/datasets';
import { getRawHistory } from '@/lib/databaseAccess';
import { shapeHistoryList } from '@/lib/history';
import { historyQuerySchema, type HistoryListResponse } from '@/types/history';

const rateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

// Bump when the response shape changes so previously-cached entries are bypassed.
const CACHE_VERSION = 'v2';

async function buildHistory(dataset: Dataset, limit: number, cursor: number | undefined): Promise<HistoryListResponse> {
	const { entries, nextCursor } = await getRawHistory(dataset, limit, cursor);
	return shapeHistoryList(dataset, entries, nextCursor);
}

function getCachedHistory(dataset: Dataset, limit: number, cursor: number | undefined) {
	return unstable_cache(() => buildHistory(dataset, limit, cursor), ['history', CACHE_VERSION, dataset, String(limit), String(cursor ?? '')], {
		revalidate: 3600,
		tags: [`statistics:${dataset}`],
	})();
}

export async function GET(request: NextRequest) {
	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
	try {
		await rateLimiter.consume(ip);
	} catch {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}

	const sp = request.nextUrl.searchParams;
	const parsed = historyQuerySchema.safeParse({
		dataset: sp.get('dataset'),
		cursor: sp.get('cursor') ?? undefined,
		limit: sp.get('limit') ?? undefined,
	});
	if (!parsed.success) return new Response('Invalid query', { status: 400 });

	try {
		const data = await getCachedHistory(parsed.data.dataset, parsed.data.limit, parsed.data.cursor);
		return Response.json(data);
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch history." }), { status: 500 });
	}
}
