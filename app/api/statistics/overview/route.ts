import { unstable_cache } from 'next/cache';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { DATASETS, datasetInfo, getDataset } from '@/data/datasets';
import { getOverviewStatistics } from '@/lib/databaseAccess';
import { shapeOverview } from '@/lib/statistics';
import type { OverviewMode, OverviewResponse, OverviewRole } from '@/types/statistics';

const rateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

// Bump when the response shape changes so previously-cached entries are bypassed.
const CACHE_VERSION = 'v1';

/** Roster role map + display metadata, keyed by base dataset id. Built per cache-miss. */
function buildLookups() {
	const datasetMeta = new Map<string, { label: string; shorthand: string; mode: OverviewMode }>(
		datasetInfo.map((d) => [d.dataset, { label: d.formattedName, shorthand: d.shorthand, mode: d.league }])
	);
	const roleByDatasetId = new Map<string, Map<number, OverviewRole>>();
	for (const ds of DATASETS) {
		const players = getDataset(ds)?.playerData ?? [];
		roleByDatasetId.set(ds, new Map(players.map((p) => [p.id, p.role as OverviewRole])));
	}
	return { datasetMeta, roleByDatasetId };
}

async function buildOverview(): Promise<OverviewResponse> {
	const raw = await getOverviewStatistics();
	return shapeOverview(raw, buildLookups());
}

// Cached per version. One full-collection aggregation; 1h revalidate keeps the DB cool.
function getCachedOverview() {
	return unstable_cache(() => buildOverview(), ['overview', CACHE_VERSION], {
		revalidate: 3600,
		tags: ['statistics:overview'],
	})();
}

export async function GET(request: NextRequest) {
	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
	try {
		await rateLimiter.consume(ip);
	} catch {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}

	try {
		const data = await getCachedOverview();
		return Response.json(data);
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch overview statistics." }), { status: 500 });
	}
}
