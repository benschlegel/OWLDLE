import { unstable_cache } from 'next/cache';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Dataset } from '@/data/datasets';
import { getAllRawHistory, getDatasetStageKeys } from '@/lib/databaseAccess';
import { shapeHistoryList } from '@/lib/history';
import { resolveStages } from '@/lib/statistics';
import { historyQuerySchema, type HistoryListResponse } from '@/types/history';

const rateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

// Bump when the response shape changes so previously-cached entries are bypassed.
const CACHE_VERSION = 'v3';

async function buildHistory(dataset: Dataset): Promise<HistoryListResponse> {
	const existingKeys = await getDatasetStageKeys(dataset);
	const { stages, datasetKeys } = resolveStages(dataset, existingKeys, 'all');
	const entries = await getAllRawHistory(dataset, datasetKeys);
	return shapeHistoryList(dataset, entries, stages);
}

function getCachedHistory(dataset: Dataset) {
	return unstable_cache(() => buildHistory(dataset), ['history', CACHE_VERSION, dataset], {
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
	const parsed = historyQuerySchema.safeParse({ dataset: sp.get('dataset') });
	if (!parsed.success) return new Response('Invalid query', { status: 400 });

	try {
		const data = await getCachedHistory(parsed.data.dataset);
		return Response.json(data);
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch history." }), { status: 500 });
	}
}
