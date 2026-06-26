import { unstable_cache } from 'next/cache';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { getPerDaySeries, getStatsBoundaryMs } from '@/lib/databaseAccess';
import { resolveTimeframe } from '@/lib/statistics';
import { type DayScope, type PerDayResponse, statisticsQuerySchema, type TimeframeRange } from '@/types/statistics';

const rateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

// Bump when the response shape changes so previously-cached entries are bypassed.
const CACHE_VERSION = 'v1';

function emptyResponse(dataset: Dataset, range: TimeframeRange, scope: DayScope): PerDayResponse {
	const nowIso = new Date().toISOString();
	return { dataset, scope, timeframe: { range, fromIso: nowIso, toIso: nowIso, label: '' }, perDay: [] };
}

async function buildPerDay(dataset: Dataset, range: TimeframeRange, from: string | undefined, to: string | undefined, scope: DayScope, useProd: boolean): Promise<PerDayResponse> {
	const boundaryMs = await getStatsBoundaryMs(dataset, useProd);
	if (boundaryMs === null) return emptyResponse(dataset, range, scope);

	const tf = resolveTimeframe(range, from, to, boundaryMs, GAME_CONFIG.nextResetHours);
	const perDay = await getPerDaySeries(dataset, tf.fromMs, tf.toMs, scope, useProd);
	return {
		dataset,
		scope,
		timeframe: { range, fromIso: new Date(tf.fromMs).toISOString(), toIso: new Date(tf.toMs).toISOString(), label: tf.label },
		perDay,
	};
}

// Cached per (version, dataset, range, from, to, scope, db). 1h revalidate matches the daily reset.
function getCachedPerDay(dataset: Dataset, range: TimeframeRange, from: string | undefined, to: string | undefined, scope: DayScope, useProd: boolean) {
	return unstable_cache(
		() => buildPerDay(dataset, range, from, to, scope, useProd),
		['perday', CACHE_VERSION, dataset, range, from ?? '', to ?? '', scope, useProd ? 'prod' : 'dev'],
		{ revalidate: 3600, tags: [`statistics:${dataset}`] }
	)();
}

export async function GET(request: NextRequest) {
	const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
	try {
		await rateLimiter.consume(ip);
	} catch {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}

	const sp = request.nextUrl.searchParams;
	const parsed = statisticsQuerySchema.safeParse({
		dataset: sp.get('dataset'),
		range: sp.get('range') ?? undefined,
		from: sp.get('from') ?? undefined,
		to: sp.get('to') ?? undefined,
	});
	if (!parsed.success) return new Response('Invalid query', { status: 400 });

	const scope: DayScope = sp.get('scope') === 'all' ? 'all' : 'current';
	// Dev-only escape hatch to read real (production) data; a no-op when already running in prod.
	const useProd = sp.get('prod') === '1';

	try {
		const data = await getCachedPerDay(parsed.data.dataset, parsed.data.range, parsed.data.from, parsed.data.to, scope, useProd);
		return Response.json(data);
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch per-day statistics." }), { status: 500 });
	}
}
