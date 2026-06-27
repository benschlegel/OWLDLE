import { unstable_cache } from 'next/cache';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { type Dataset, getDataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { getDatasetStageKeys, getRawStatistics, getStatsBoundaryMs } from '@/lib/databaseAccess';
import { resolveStages, resolveTimeframe, shapeStatistics } from '@/lib/statistics';
import { statisticsQuerySchema, type StatisticsResponse, type TimeframeRange } from '@/types/statistics';

const rateLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

function emptyResponse(dataset: Dataset, range: TimeframeRange): StatisticsResponse {
	const nowIso = new Date().toISOString();
	return {
		dataset,
		timeframe: { range, fromIso: nowIso, toIso: nowIso, label: '' },
		summary: { gamesPlayed: 0, wins: 0, losses: 0, winRate: 0, averageGuesses: null, solvedFirstGuessRate: 0 },
		guessDistribution: [],
		topFirstGuesses: [],
		topFirstTeams: [],
		hardestPuzzles: [],
		stages: [],
		stage: 'all',
	};
}

async function buildStatistics(dataset: Dataset, range: TimeframeRange, from: string | undefined, to: string | undefined, stage: string | undefined): Promise<StatisticsResponse> {
	const boundaryMs = await getStatsBoundaryMs(dataset);
	if (boundaryMs === null) return emptyResponse(dataset, range);

	const tf = resolveTimeframe(range, from, to, boundaryMs, GAME_CONFIG.nextResetHours);
	const existingKeys = await getDatasetStageKeys(dataset);
	const { stages, selected, datasetKeys } = resolveStages(dataset, existingKeys, stage);
	const raw = await getRawStatistics(dataset, tf.fromMs, tf.toMs, datasetKeys);

	const idToTeam = new Map((getDataset(dataset)?.playerData ?? []).map((p) => [p.id, p.team]));
	return shapeStatistics(raw, {
		dataset,
		timeframe: { range, fromIso: new Date(tf.fromMs).toISOString(), toIso: new Date(tf.toMs).toISOString(), label: tf.label },
		idToTeam,
		maxGuesses: GAME_CONFIG.maxGuesses,
		stages,
		stage: selected,
	});
}

// Bump when the response shape changes so previously-cached entries are bypassed.
const CACHE_VERSION = 'v3';

// Cached per (version, dataset, range, from, to, stage, db). Historical timeframes only change once
// per day at reset, so a 1h revalidate keeps the DB cool while staying fresh.
function getCachedStatistics(dataset: Dataset, range: TimeframeRange, from: string | undefined, to: string | undefined, stage: string | undefined) {
	return unstable_cache(
		() => buildStatistics(dataset, range, from, to, stage),
		['statistics', CACHE_VERSION, dataset, range, from ?? '', to ?? '', stage ?? 'all'],
		{
			revalidate: 3600,
			tags: [`statistics:${dataset}`],
		}
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
		stage: sp.get('stage') ?? undefined,
	});
	if (!parsed.success) return new Response('Invalid query', { status: 400 });

	try {
		const data = await getCachedStatistics(parsed.data.dataset, parsed.data.range, parsed.data.from, parsed.data.to, parsed.data.stage);
		return Response.json(data);
	} catch {
		return new Response(JSON.stringify({ message: "Couldn't fetch statistics." }), { status: 500 });
	}
}
