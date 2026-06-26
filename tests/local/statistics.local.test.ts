import { describe, expect, test, beforeEach } from 'vitest';
import { getPerDaySeries, getRawStatistics, getStatsBoundaryMs, getOverviewStatistics } from '@/lib/databaseAccess';
import { resolveTimeframe, shapeStatistics, baseDataset, shapeOverview } from '@/lib/statistics';
import type { RawStatistics, RawOverview } from '@/lib/database/statistics';
import type { Dataset } from '@/data/datasets';
import type { DbAnswer, DbPlayer } from '@/types/database';
import { dbName, answerCollectionName, iterationsCollectionName } from '@/lib/databaseAccess';
import type { OverviewMode, OverviewRole } from '@/types/statistics';
import { MongoClient } from 'mongodb';

const ds: Dataset = 'season1';
const GAME_LOGS = 'game_logs';

function getClient() {
	const uri = process.env.MONGO_URI;
	if (!uri) throw new Error('MONGO_URI not set');
	return new MongoClient(uri);
}

async function clearCollections() {
	const client = getClient();
	try {
		await client.connect();
		const db = client.db(dbName);
		await Promise.all([
			db.collection(GAME_LOGS).deleteMany({}),
			db.collection(answerCollectionName).deleteMany({}),
			db.collection(iterationsCollectionName).deleteMany({}),
		]);
	} finally {
		await client.close();
	}
}

function makeLog(opts: {
	dataset?: Dataset;
	iteration?: number;
	gameResult: 'won' | 'lost';
	finishedAt: Date;
	gameData: { player: { name: string; id: number } }[];
}) {
	return {
		dataset: opts.dataset ?? ds,
		iteration: opts.iteration ?? 1,
		gameResult: opts.gameResult,
		finishedAt: opts.finishedAt,
		gameData: opts.gameData.map((g) => ({ guessResult: {}, player: g.player })),
	};
}

// getRawStatistics
describe('getRawStatistics, summary & distribution', () => {
	beforeEach(clearCollections);

	test('correct summary counts for a mix of wins and losses', async () => {
		const client = getClient();
		try {
			await client.connect();
			await client
				.db(dbName)
				.collection(GAME_LOGS)
				.insertMany([
					// win with 1 guess (solvedFirst)
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T10:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					// win with 3 guesses
					makeLog({
						gameResult: 'won',
						finishedAt: new Date('2026-06-20T11:00:00Z'),
						gameData: [{ player: { name: 'A', id: 0 } }, { player: { name: 'B', id: 1 } }, { player: { name: 'C', id: 2 } }],
					}),
					// loss
					makeLog({
						gameResult: 'lost',
						finishedAt: new Date('2026-06-20T12:00:00Z'),
						gameData: [{ player: { name: 'A', id: 0 } }, { player: { name: 'B', id: 1 } }],
					}),
				] as any);
		} finally {
			await client.close();
		}

		const from = new Date('2026-06-20T00:00:00Z').getTime();
		const to = new Date('2026-06-21T00:00:00Z').getTime();
		const raw = await getRawStatistics(ds, from, to);

		expect(raw.summary.gamesPlayed).toBe(3);
		expect(raw.summary.wins).toBe(2);
		expect(raw.summary.winGuessSum).toBe(4); // 1 + 3
		expect(raw.summary.solvedFirst).toBe(1);
	});

	test('distribution buckets reflect correct guess counts', async () => {
		const client = getClient();
		try {
			await client.connect();
			await client
				.db(dbName)
				.collection(GAME_LOGS)
				.insertMany([
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T10:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					makeLog({
						gameResult: 'won',
						finishedAt: new Date('2026-06-20T11:00:00Z'),
						gameData: [{ player: { name: 'A', id: 0 } }, { player: { name: 'B', id: 1 } }],
					}),
					makeLog({ gameResult: 'lost', finishedAt: new Date('2026-06-20T12:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
				] as any);
		} finally {
			await client.close();
		}

		const raw = await getRawStatistics(ds, new Date('2026-06-20T00:00:00Z').getTime(), new Date('2026-06-21T00:00:00Z').getTime());

		const distMap = new Map(raw.distribution.map((d) => [d.bucket, d.count]));
		expect(distMap.get('1')).toBe(1);
		expect(distMap.get('2')).toBe(1);
		expect(distMap.get('failed')).toBe(1);
	});
});

describe('getRawStatistics, first-guess grouping', () => {
	beforeEach(clearCollections);

	test('groups and sorts first guesses by count descending', async () => {
		const client = getClient();
		try {
			await client.connect();
			await client
				.db(dbName)
				.collection(GAME_LOGS)
				.insertMany([
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T10:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T11:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T12:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					makeLog({ gameResult: 'lost', finishedAt: new Date('2026-06-20T13:00:00Z'), gameData: [{ player: { name: 'B', id: 1 } }] }),
				] as any);
		} finally {
			await client.close();
		}

		const raw = await getRawStatistics(ds, new Date('2026-06-20T00:00:00Z').getTime(), new Date('2026-06-21T00:00:00Z').getTime());

		expect(raw.firstGuesses).toHaveLength(2);
		expect(raw.firstGuesses[0]).toMatchObject({ name: 'A', id: 0, count: 3 });
		expect(raw.firstGuesses[1]).toMatchObject({ name: 'B', id: 1, count: 1 });
	});
});

describe('getRawStatistics, window boundaries', () => {
	beforeEach(clearCollections);

	test('excludes logs outside the [fromMs, toMs) window', async () => {
		const from = new Date('2026-06-20T00:00:00Z').getTime();
		const to = new Date('2026-06-21T00:00:00Z').getTime();

		const client = getClient();
		try {
			await client.connect();
			await client
				.db(dbName)
				.collection(GAME_LOGS)
				.insertMany([
					// inside window
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T12:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					// before window (excluded)
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-19T23:59:59Z'), gameData: [{ player: { name: 'B', id: 1 } }] }),
					// at toMs boundary — excluded (lt, not lte)
					makeLog({ gameResult: 'won', finishedAt: new Date(to), gameData: [{ player: { name: 'C', id: 2 } }] }),
				] as any);
		} finally {
			await client.close();
		}

		const raw = await getRawStatistics(ds, from, to);
		expect(raw.summary.gamesPlayed).toBe(1);
	});

	test('fromMs >= toMs returns empty shape without throwing', async () => {
		const raw = await getRawStatistics(ds, 1000, 1000);
		expect(raw.summary.gamesPlayed).toBe(0);
		expect(raw.summary.wins).toBe(0);
		expect(raw.distribution).toHaveLength(0);
		expect(raw.firstGuesses).toHaveLength(0);
		expect(raw.hardestPuzzles).toHaveLength(0);
	});
});

describe('getPerDaySeries', () => {
	beforeEach(clearCollections);

	test('produces ascending per-day rows with correct played/wins counts', async () => {
		const client = getClient();
		try {
			await client.connect();
			await client
				.db(dbName)
				.collection(GAME_LOGS)
				.insertMany([
					// day 1
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-20T08:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					makeLog({ gameResult: 'lost', finishedAt: new Date('2026-06-20T09:00:00Z'), gameData: [{ player: { name: 'B', id: 1 } }] }),
					// day 2
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-21T08:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
					makeLog({ gameResult: 'won', finishedAt: new Date('2026-06-21T09:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
				] as any);
		} finally {
			await client.close();
		}

		const perDay = await getPerDaySeries(ds, new Date('2026-06-20T00:00:00Z').getTime(), new Date('2026-06-22T00:00:00Z').getTime(), 'current');

		expect(perDay).toHaveLength(2);
		expect(perDay[0]).toMatchObject({ date: '2026-06-20', played: 2, wins: 1 });
		expect(perDay[1]).toMatchObject({ date: '2026-06-21', played: 2, wins: 2 });
	});

	test('returns empty when fromMs >= toMs', async () => {
		expect(await getPerDaySeries(ds, 1000, 1000, 'current')).toHaveLength(0);
	});
});

// getStatsBoundaryMs
describe('getStatsBoundaryMs', () => {
	beforeEach(clearCollections);

	test('returns null when no current answer exists', async () => {
		const boundary = await getStatsBoundaryMs(ds);
		expect(boundary).toBeNull();
	});

	test('returns nextReset − 24h when current answer exists', async () => {
		const nextReset = new Date('2026-06-25T12:00:00Z');
		const mockPlayer: DbPlayer = { name: 'Player', id: 1, role: 'Damage', team: 'Team', country: 'US', region: 'NA' } as unknown as DbPlayer;
		const answer: DbAnswer = { iteration: 1, nextReset, player: mockPlayer };

		const client = getClient();
		try {
			await client.connect();
			const db = client.db(dbName);
			await db.collection(answerCollectionName).updateOne({ _id: `current_${ds}` as any }, { $set: { _id: `current_${ds}`, ...answer } }, { upsert: true });
		} finally {
			await client.close();
		}

		const boundary = await getStatsBoundaryMs(ds);
		const expectedBoundary = nextReset.getTime() - 24 * 3600 * 1000;
		expect(boundary).toBe(expectedBoundary);
	});
});

// shapeStatistics (pure)
describe('shapeStatistics, pure function', () => {
	const baseTimeframe = { range: 'last7' as const, fromIso: '2026-06-14T00:00:00.000Z', toIso: '2026-06-21T00:00:00.000Z', label: 'Last 7 days' };
	const maxGuesses = 7;

	test('ordered guessDistribution with zero-filled buckets', () => {
		const raw: RawStatistics = {
			summary: { gamesPlayed: 3, wins: 2, winGuessSum: 5, solvedFirst: 0 },
			distribution: [
				{ bucket: '2', count: 1 },
				{ bucket: '3', count: 1 },
				{ bucket: 'failed', count: 1 },
			],
			firstGuesses: [],
			hardestPuzzles: [],
		};

		const result = shapeStatistics(raw, { dataset: ds, timeframe: baseTimeframe, idToTeam: new Map(), maxGuesses });

		expect(result.guessDistribution).toHaveLength(maxGuesses + 1); // 1..7 + failed
		expect(result.guessDistribution[0]).toEqual({ bucket: '1', count: 0 });
		expect(result.guessDistribution[1]).toEqual({ bucket: '2', count: 1 });
		expect(result.guessDistribution[2]).toEqual({ bucket: '3', count: 1 });
		expect(result.guessDistribution[maxGuesses]).toEqual({ bucket: 'failed', count: 1 });
	});

	test('winRate, averageGuesses, and solvedFirstGuessRate math', () => {
		// 2 wins out of 4 games; winGuessSum=5 (2+3); solvedFirst=0
		const raw: RawStatistics = {
			summary: { gamesPlayed: 4, wins: 2, winGuessSum: 5, solvedFirst: 1 },
			distribution: [],
			firstGuesses: [],
			hardestPuzzles: [],
		};

		const result = shapeStatistics(raw, { dataset: ds, timeframe: baseTimeframe, idToTeam: new Map(), maxGuesses });

		expect(result.summary.winRate).toBe(50); // 2/4 = 50%
		expect(result.summary.averageGuesses).toBe(2.5); // 5/2
		expect(result.summary.solvedFirstGuessRate).toBe(25); // 1/4 = 25%
		expect(result.summary.losses).toBe(2);
	});

	test('averageGuesses is null when no wins', () => {
		const raw: RawStatistics = {
			summary: { gamesPlayed: 2, wins: 0, winGuessSum: 0, solvedFirst: 0 },
			distribution: [],
			firstGuesses: [],
			hardestPuzzles: [],
		};

		const result = shapeStatistics(raw, { dataset: ds, timeframe: baseTimeframe, idToTeam: new Map(), maxGuesses });
		expect(result.summary.averageGuesses).toBeNull();
	});

	test('topFirstTeams folds two ids on the same team into one summed bucket', () => {
		const raw: RawStatistics = {
			summary: { gamesPlayed: 5, wins: 5, winGuessSum: 5, solvedFirst: 5 },
			distribution: [],
			firstGuesses: [
				{ id: 0, name: 'A', count: 3 },
				{ id: 1, name: 'B', count: 2 },
				{ id: 2, name: 'C', count: 1 },
			],
			hardestPuzzles: [],
		};

		// id 0 and 1 are both on 'TeamX'; id 2 is on 'TeamY'
		const idToTeam = new Map<number, string>([
			[0, 'TeamX'],
			[1, 'TeamX'],
			[2, 'TeamY'],
		]);

		const result = shapeStatistics(raw, { dataset: ds, timeframe: baseTimeframe, idToTeam, maxGuesses });

		expect(result.topFirstTeams).toHaveLength(2);
		expect(result.topFirstTeams[0]).toEqual({ team: 'TeamX', count: 5 });
		expect(result.topFirstTeams[1]).toEqual({ team: 'TeamY', count: 1 });
	});

	test('empty input produces all-zero summary and empty arrays', () => {
		const raw: RawStatistics = {
			summary: { gamesPlayed: 0, wins: 0, winGuessSum: 0, solvedFirst: 0 },
			distribution: [],
			firstGuesses: [],
			hardestPuzzles: [],
		};

		const result = shapeStatistics(raw, { dataset: ds, timeframe: baseTimeframe, idToTeam: new Map(), maxGuesses });

		expect(result.summary.gamesPlayed).toBe(0);
		expect(result.summary.wins).toBe(0);
		expect(result.summary.winRate).toBe(0);
		expect(result.summary.averageGuesses).toBeNull();
		expect(result.summary.solvedFirstGuessRate).toBe(0);
		expect(result.guessDistribution.every((b) => b.count === 0)).toBe(true);
		expect(result.topFirstGuesses).toHaveLength(0);
		expect(result.topFirstTeams).toHaveLength(0);
		expect(result.hardestPuzzles).toHaveLength(0);
	});
});

// resolveTimeframe (pure)
describe('resolveTimeframe', () => {
	const BOUNDARY_MS = new Date('2026-06-25T12:00:00Z').getTime();
	const NEXT_RESET_HOURS = 24;
	const DAY_MS = 86_400_000;
	const HOUR_MS = 3_600_000;

	test("'yesterday' returns [boundary−24h, boundary)", () => {
		const tf = resolveTimeframe('yesterday', undefined, undefined, BOUNDARY_MS, NEXT_RESET_HOURS);
		expect(tf.fromMs).toBe(BOUNDARY_MS - NEXT_RESET_HOURS * HOUR_MS);
		expect(tf.toMs).toBe(BOUNDARY_MS);
		expect(tf.label).toBe('Yesterday');
	});

	test("'last7' returns [boundary−7d, boundary)", () => {
		const tf = resolveTimeframe('last7', undefined, undefined, BOUNDARY_MS, NEXT_RESET_HOURS);
		expect(tf.fromMs).toBe(BOUNDARY_MS - 7 * DAY_MS);
		expect(tf.toMs).toBe(BOUNDARY_MS);
	});

	test("'all' returns [0, boundary)", () => {
		const tf = resolveTimeframe('all', undefined, undefined, BOUNDARY_MS, NEXT_RESET_HOURS);
		expect(tf.fromMs).toBe(0);
		expect(tf.toMs).toBe(BOUNDARY_MS);
		expect(tf.label).toBe('All time');
	});

	test("'custom' clamps toMs to boundary when requested to date is in the future", () => {
		// from=2026-06-24, to=2026-12-31 (way in the future)
		const tf = resolveTimeframe('custom', '2026-06-24', '2026-12-31', BOUNDARY_MS, NEXT_RESET_HOURS);
		expect(tf.fromMs).toBe(new Date('2026-06-24T00:00:00Z').getTime());
		// toMs should be clamped to boundary
		expect(tf.toMs).toBe(BOUNDARY_MS);
	});

	test("'custom' does not clamp toMs when end date is before boundary", () => {
		// from=2026-06-20, to=2026-06-22 (both before boundary=2026-06-25T12:00)
		const tf = resolveTimeframe('custom', '2026-06-20', '2026-06-22', BOUNDARY_MS, NEXT_RESET_HOURS);
		expect(tf.fromMs).toBe(new Date('2026-06-20T00:00:00Z').getTime());
		// to=June 22 00:00Z + 1 day = June 23 00:00Z — still before boundary
		const expectedTo = new Date('2026-06-23T00:00:00Z').getTime();
		expect(tf.toMs).toBe(expectedTo);
	});
});

describe('baseDataset', () => {
	test('strips -stage<N> suffix', () => {
		expect(baseDataset('owcs-s3-stage1')).toBe('owcs-s3');
		expect(baseDataset('owcs-s3-stage12')).toBe('owcs-s3');
	});

	test('leaves non-stage dataset ids unchanged', () => {
		expect(baseDataset('season6')).toBe('season6');
		expect(baseDataset('owcs-s3')).toBe('owcs-s3');
	});
});

// getOverviewStatistics (DB shape)
describe('getOverviewStatistics', () => {
	beforeEach(clearCollections);

	test('produces correct byDataset, byWeekdayHour, firstRole, allRole shapes', async () => {
		const client = getClient();
		try {
			await client.connect();
			await client
				.db(dbName)
				.collection(GAME_LOGS)
				.insertMany([
					// season1, won, Mon 2026-06-22 09:00 UTC (ISO weekday 1, hour 9), 2 guesses
					makeLog({
						dataset: 'season1',
						gameResult: 'won',
						finishedAt: new Date('2026-06-22T09:00:00Z'),
						gameData: [{ player: { name: 'A', id: 0 } }, { player: { name: 'B', id: 1 } }],
					}),
					// season1, lost, Mon 2026-06-22 09:30 UTC (ISO weekday 1, hour 9), 1 guess
					makeLog({
						dataset: 'season1',
						gameResult: 'lost',
						finishedAt: new Date('2026-06-22T09:30:00Z'),
						gameData: [{ player: { name: 'A', id: 0 } }],
					}),
					// owcs-s3, won, Sun 2026-06-28 20:00 UTC (ISO weekday 7, hour 20), 1 guess
					makeLog({
						dataset: 'owcs-s3',
						gameResult: 'won',
						finishedAt: new Date('2026-06-28T20:00:00Z'),
						gameData: [{ player: { name: 'X', id: 0 } }],
					}),
				] as any);
		} finally {
			await client.close();
		}

		const raw = await getOverviewStatistics();

		// byDataset, sort before asserting (facet order unspecified)
		const sorted = [...raw.byDataset].sort((a, b) => a.dataset.localeCompare(b.dataset));
		const s1 = sorted.find((d) => d.dataset === 'season1');
		const o3 = sorted.find((d) => d.dataset === 'owcs-s3');
		expect(s1).toMatchObject({ dataset: 'season1', played: 2, wins: 1, winGuessSum: 2 });
		expect(o3).toMatchObject({ dataset: 'owcs-s3', played: 1, wins: 1, winGuessSum: 1 });

		// byWeekdayHour
		const wh = [...raw.byWeekdayHour].sort((a, b) => a.weekday - b.weekday || a.hour - b.hour);
		const mon9 = wh.find((r) => r.weekday === 1 && r.hour === 9 && r.dataset === 'season1');
		const sun20 = wh.find((r) => r.weekday === 7 && r.hour === 20 && r.dataset === 'owcs-s3');
		expect(mon9).toMatchObject({ weekday: 1, hour: 9, dataset: 'season1', played: 2 });
		expect(sun20).toMatchObject({ weekday: 7, hour: 20, dataset: 'owcs-s3', played: 1 });

		// firstRole, both season1 games start with id 0
		const fr = [...raw.firstRole].sort((a, b) => a.dataset.localeCompare(b.dataset) || (a.id ?? 0) - (b.id ?? 0));
		expect(fr.find((r) => r.dataset === 'season1' && r.id === 0)).toMatchObject({ dataset: 'season1', id: 0, count: 2 });
		expect(fr.find((r) => r.dataset === 'owcs-s3' && r.id === 0)).toMatchObject({ dataset: 'owcs-s3', id: 0, count: 1 });

		// allRole, season1 id:0 ×2, season1 id:1 ×1 (from the 2-guess win), owcs-s3 id:0 ×1
		const ar = [...raw.allRole].sort((a, b) => a.dataset.localeCompare(b.dataset) || (a.id ?? 0) - (b.id ?? 0));
		expect(ar.find((r) => r.dataset === 'season1' && r.id === 0)).toMatchObject({ count: 2 });
		expect(ar.find((r) => r.dataset === 'season1' && r.id === 1)).toMatchObject({ count: 1 });
		expect(ar.find((r) => r.dataset === 'owcs-s3' && r.id === 0)).toMatchObject({ count: 1 });
	});
});

describe('shapeOverview', () => {
	const meta = new Map([
		['season1', { label: 'Season 1 (2018)', shorthand: 'S1', mode: 'owl' as OverviewMode }],
		['owcs-s3', { label: 'OWCS S3 (2026)', shorthand: 'S3', mode: 'owcs' as OverviewMode }],
	]);
	const roles = new Map([
		[
			'season1',
			new Map<number, OverviewRole>([
				[0, 'Tank'],
				[1, 'Damage'],
			]),
		],
		['owcs-s3', new Map<number, OverviewRole>([[0, 'Support']])],
	]);
	const raw: RawOverview = {
		byDataset: [
			{ dataset: 'season1', played: 10, wins: 6, winGuessSum: 18 },
			{ dataset: 'owcs-s3', played: 4, wins: 4, winGuessSum: 8 },
			{ dataset: 'owcs-s3-stage1', played: 1, wins: 0, winGuessSum: 0 }, // folds into owcs-s3
		],
		byWeekdayHour: [
			{ weekday: 1, hour: 9, dataset: 'season1', played: 7 },
			{ weekday: 1, hour: 9, dataset: 'owcs-s3', played: 3 },
			{ weekday: 7, hour: 20, dataset: 'owcs-s3-stage1', played: 2 }, // mode owcs via base
		],
		firstRole: [
			{ dataset: 'season1', id: 0, count: 5 }, // Tank
			{ dataset: 'season1', id: 1, count: 5 }, // Damage
			{ dataset: 'owcs-s3', id: 0, count: 4 }, // Support
			{ dataset: 'season1', id: 999, count: 3 }, // unresolved → skipped
			{ dataset: 'season1', id: null, count: 2 }, // null → skipped
		],
		allRole: [
			{ dataset: 'season1', id: 0, count: 8 }, // Tank
			{ dataset: 'owcs-s3-stage1', id: 0, count: 1 }, // base owcs-s3 id 0 → Support
		],
	};

	const out = shapeOverview(raw, { datasetMeta: meta, roleByDatasetId: roles });

	test('totalGames is sum of all played including stage', () => {
		expect(out.totalGames).toBe(15); // 10 + 4 + 1
	});

	test('byDataset folds stage, computes winRate/avgGuesses, sorts played desc', () => {
		expect(out.byDataset).toHaveLength(2);
		const s1 = out.byDataset.find((d) => d.dataset === 'season1');
		const o3 = out.byDataset.find((d) => d.dataset === 'owcs-s3');
		expect(s1).toMatchObject({ played: 10, wins: 6, winRate: 60, avgGuesses: 3 });
		expect(o3).toMatchObject({ played: 5, wins: 4, winRate: 80, avgGuesses: 2 }); // 4+1 folded
		// sorted played desc → season1 first
		expect(out.byDataset[0].dataset).toBe('season1');
	});

	test('byWeekday has 7 entries with correct mode-split counts', () => {
		expect(out.byWeekday).toHaveLength(7);
		const w1 = out.byWeekday.find((w) => w.weekday === 1);
		const w7 = out.byWeekday.find((w) => w.weekday === 7);
		expect(w1).toMatchObject({ played: 10, owl: 7, owcs: 3 });
		expect(w7).toMatchObject({ played: 2, owl: 0, owcs: 2 });
		// all other weekdays zero
		expect(out.byWeekday.filter((w) => w.weekday !== 1 && w.weekday !== 7).every((w) => w.played === 0)).toBe(true);
	});

	test('byHour has 24 entries with correct mode-split counts', () => {
		expect(out.byHour).toHaveLength(24);
		const h9 = out.byHour.find((h) => h.hour === 9);
		const h20 = out.byHour.find((h) => h.hour === 20);
		expect(h9).toMatchObject({ played: 10, owl: 7, owcs: 3 });
		expect(h20).toMatchObject({ played: 2, owl: 0, owcs: 2 });
	});

	test('heatmap contains correct cells', () => {
		const cell1 = out.heatmap.find((c) => c.weekday === 1 && c.hour === 9);
		const cell7 = out.heatmap.find((c) => c.weekday === 7 && c.hour === 20);
		expect(cell1).toMatchObject({ played: 10 });
		expect(cell7).toMatchObject({ played: 2 });
	});

	test('byRole resolves roles in fixed order, skips null/unresolved ids, folds stages', () => {
		expect(out.byRole).toEqual([
			{ role: 'Tank', first: 5, all: 8 },
			{ role: 'Damage', first: 5, all: 0 },
			{ role: 'Support', first: 4, all: 1 }, // stage1 id 0 → owcs-s3 id 0 → Support
		]);
	});
});
