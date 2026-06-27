import { unstable_cache } from 'next/cache';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { getRawHistoryDetail } from '@/lib/databaseAccess';
import { shapeHistoryDetail } from '@/lib/history';
import { historyDetailQuerySchema, type HistoryDetailResponse } from '@/types/history';

const rateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });
const CACHE_VERSION = 'v1';

async function buildDetail(dataset: Dataset, iteration: number): Promise<HistoryDetailResponse | null> {
	const raw = await getRawHistoryDetail(dataset, iteration);
	if (!raw) return null;
	return shapeHistoryDetail(dataset, raw, GAME_CONFIG.maxGuesses);
}

function getCachedDetail(dataset: Dataset, iteration: number) {
	return unstable_cache(() => buildDetail(dataset, iteration), ['history-detail', CACHE_VERSION, dataset, String(iteration)], {
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
	const parsed = historyDetailQuerySchema.safeParse({ dataset: sp.get('dataset'), iteration: sp.get('iteration') });
	if (!parsed.success) return new Response('Invalid query', { status: 400 });

	try {
		const data = await getCachedDetail(parsed.data.dataset, parsed.data.iteration);
		if (!data) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
		return Response.json(data);
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch puzzle detail." }), { status: 500 });
	}
}
