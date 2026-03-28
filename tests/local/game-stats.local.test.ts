import { describe, expect, test, beforeEach } from 'vitest';
import {
	updateGameStats,
	getGameStats,
	setCurrentAnswer,
	getCurrentIteration,
	dbName,
	backlogCollectionName,
	playerCollectionName,
} from '@/lib/databaseAccess';
import type { Dataset } from '@/data/datasets';
import type { DbAnswer, DbPlayer } from '@/types/database';
import { MongoClient } from 'mongodb';
import { trimAndAddHours, trimDate } from '@/lib/utils';

const ds: Dataset = 'season1';

function getClient() {
	const uri = process.env.MONGO_URI;
	if (!uri) throw new Error('MONGO_URI not set');
	return new MongoClient(uri);
}

async function clearStats() {
	const client = getClient();
	try {
		await client.connect();
		await client.db(dbName).collection('game_stats').deleteMany({});
	} finally {
		await client.close();
	}
}

async function clearAll() {
	const client = getClient();
	try {
		await client.connect();
		await client.db(dbName).dropDatabase();
	} finally {
		await client.close();
	}
}

function assertDefined<T>(value: T | null | undefined, msg = 'Expected non-null'): T {
	expect(value, msg).not.toBeNull();
	expect(value, msg).not.toBeUndefined();
	return value as T;
}

const mockPlayer = {
	name: 'TestPlayer',
	id: 1,
	role: 'Damage',
	team: 'Boston Uprising',
	country: 'US',
	region: 'NA',
} as unknown as DbPlayer;

const mockPlayer2 = {
	name: 'TestPlayer2',
	id: 2,
	role: 'Tank',
	team: 'Boston Uprising',
	country: 'KR',
	region: 'Korea',
} as unknown as DbPlayer;

/** Seed backlog + players directly via MongoClient (avoids importing formattedPlayers which needs Node 20+) */
async function seedBacklogAndPlayers(dataset: Dataset, players: DbPlayer[]) {
	const client = getClient();
	try {
		await client.connect();
		const db = client.db(dbName);
		await db.collection(playerCollectionName).updateOne({ _id: dataset as any }, { $set: { _id: dataset, players } }, { upsert: true });
		await db.collection(backlogCollectionName).updateOne({ _id: dataset as any }, { $set: { _id: dataset, players } }, { upsert: true });
	} finally {
		await client.close();
	}
}

describe('game stats - updateGameStats', () => {
	beforeEach(async () => {
		await clearStats();
	});

	test('creates stats document on first update (upsert)', async () => {
		const result = assertDefined(await updateGameStats(ds, 1, 'won', 3));
		expect(result.totalGames).toBe(1);
		expect(result.wins).toBe(1);
		expect(result.losses).toBe(0);
		expect(result.dataset).toBe(ds);
		expect(result.iteration).toBe(1);
		expect(result.guessDistribution['3']).toBe(1);
	});

	test('increments existing stats atomically', async () => {
		await updateGameStats(ds, 1, 'won', 3);
		await updateGameStats(ds, 1, 'won', 3);
		await updateGameStats(ds, 1, 'lost', 7);

		const stats = assertDefined(await getGameStats(ds, 1));
		expect(stats.totalGames).toBe(3);
		expect(stats.wins).toBe(2);
		expect(stats.losses).toBe(1);
		expect(stats.guessDistribution['3']).toBe(2);
		expect(stats.guessDistribution.failed).toBe(1);
	});

	test('loss records under "failed" distribution key', async () => {
		const result = assertDefined(await updateGameStats(ds, 1, 'lost', 7));
		expect(result.losses).toBe(1);
		expect(result.wins).toBe(0);
		expect(result.guessDistribution.failed).toBe(1);
		expect(result.guessDistribution['7']).toBeUndefined();
	});

	test('different guess counts create separate distribution entries', async () => {
		await updateGameStats(ds, 1, 'won', 1);
		await updateGameStats(ds, 1, 'won', 2);
		await updateGameStats(ds, 1, 'won', 5);
		await updateGameStats(ds, 1, 'won', 5);

		const stats = assertDefined(await getGameStats(ds, 1));
		expect(stats.guessDistribution['1']).toBe(1);
		expect(stats.guessDistribution['2']).toBe(1);
		expect(stats.guessDistribution['5']).toBe(2);
		expect(stats.guessDistribution['3']).toBeUndefined();
	});

	test('first win is detectable from stats.wins === 1', async () => {
		const result = assertDefined(await updateGameStats(ds, 1, 'won', 4));
		expect(result.wins === 1).toBe(true);

		const result2 = assertDefined(await updateGameStats(ds, 1, 'won', 2));
		expect(result2.wins === 1).toBe(false);
	});

	test('loss before any win — first win still detectable', async () => {
		const lossResult = assertDefined(await updateGameStats(ds, 1, 'lost', 7));
		expect(lossResult.wins).toBe(0);

		const winResult = assertDefined(await updateGameStats(ds, 1, 'won', 3));
		expect(winResult.wins).toBe(1);
		expect(winResult.wins === 1).toBe(true);
	});
});

describe('game stats - dataset isolation', () => {
	beforeEach(async () => {
		await clearStats();
	});

	test('stats are independent per dataset', async () => {
		const ds2: Dataset = 'season6';
		await updateGameStats(ds, 1, 'won', 2);
		await updateGameStats(ds, 1, 'won', 3);
		await updateGameStats(ds2, 1, 'lost', 7);

		const stats1 = assertDefined(await getGameStats(ds, 1));
		const stats2 = assertDefined(await getGameStats(ds2, 1));

		expect(stats1.totalGames).toBe(2);
		expect(stats1.wins).toBe(2);
		expect(stats2.totalGames).toBe(1);
		expect(stats2.losses).toBe(1);
	});

	test('stats are independent per iteration within same dataset', async () => {
		await updateGameStats(ds, 1, 'won', 2);
		await updateGameStats(ds, 1, 'won', 3);
		await updateGameStats(ds, 2, 'lost', 7);

		const statsIter1 = assertDefined(await getGameStats(ds, 1));
		const statsIter2 = assertDefined(await getGameStats(ds, 2));

		expect(statsIter1.totalGames).toBe(2);
		expect(statsIter1.wins).toBe(2);
		expect(statsIter2.totalGames).toBe(1);
		expect(statsIter2.losses).toBe(1);
	});
});

describe('game stats - getGameStats', () => {
	beforeEach(async () => {
		await clearStats();
	});

	test('returns null for non-existent stats', async () => {
		const stats = await getGameStats(ds, 999);
		expect(stats).toBeNull();
	});

	test('returns full document after updates', async () => {
		await updateGameStats(ds, 42, 'won', 3);
		const stats = assertDefined(await getGameStats(ds, 42));
		expect(stats._id).toBe('stats_season1_42');
		expect(stats.dataset).toBe(ds);
		expect(stats.iteration).toBe(42);
		expect(stats.totalGames).toBe(1);
	});
});

describe('game stats - iteration rollover', () => {
	beforeEach(async () => {
		await clearAll();
	});

	test('new iteration creates fresh stats, old stats preserved', async () => {
		await updateGameStats(ds, 1, 'won', 2);
		await updateGameStats(ds, 1, 'won', 4);
		await updateGameStats(ds, 1, 'lost', 7);

		// New iteration has no stats yet
		const statsIter2Before = await getGameStats(ds, 2);
		expect(statsIter2Before).toBeNull();

		// First game in iteration 2
		const result = assertDefined(await updateGameStats(ds, 2, 'won', 1));
		expect(result.totalGames).toBe(1);
		expect(result.wins).toBe(1);

		// Old iteration 1 stats are still intact
		const statsIter1 = assertDefined(await getGameStats(ds, 1));
		expect(statsIter1.totalGames).toBe(3);
		expect(statsIter1.wins).toBe(2);
		expect(statsIter1.losses).toBe(1);
	});

	test('iteration advance via setCurrentAnswer changes current iteration while old stats remain', async () => {
		// Seed backlog directly to avoid formattedPlayers import
		const backlogPlayers = Array.from({ length: 5 }, (_, i) => ({
			...mockPlayer,
			name: `BacklogPlayer${i}`,
			id: 100 + i,
		})) as unknown as DbPlayer[];
		await seedBacklogAndPlayers(ds, backlogPlayers);

		// Set up iteration 1
		const now = trimDate(new Date());
		const nextReset = trimAndAddHours(now, 24);
		const answer1: DbAnswer = { iteration: 1, nextReset, player: mockPlayer };
		await setCurrentAnswer(answer1, ds);

		// Record stats for iteration 1
		await updateGameStats(ds, 1, 'won', 3);
		await updateGameStats(ds, 1, 'lost', 7);

		// Simulate advancing to iteration 2 by setting new current answer
		const answer2: DbAnswer = { iteration: 2, nextReset: trimAndAddHours(nextReset, 24), player: mockPlayer2 };
		await setCurrentAnswer(answer2, ds);

		// Verify iteration advanced
		const currentIteration = assertDefined(await getCurrentIteration(ds), 'Expected current iteration');
		expect(currentIteration).toBe(2);

		// Old stats for iteration 1 still intact
		const oldStats = assertDefined(await getGameStats(ds, 1));
		expect(oldStats.totalGames).toBe(2);
		expect(oldStats.wins).toBe(1);
		expect(oldStats.losses).toBe(1);

		// New iteration has no stats yet
		const newStats = await getGameStats(ds, 2);
		expect(newStats).toBeNull();

		// First game in new iteration creates fresh stats
		const result = assertDefined(await updateGameStats(ds, 2, 'won', 1));
		expect(result.totalGames).toBe(1);
		expect(result.wins).toBe(1);
		// First win in new iteration
		expect(result.wins === 1).toBe(true);
	});

	test('multiple iterations accumulate independent stats', async () => {
		// Iteration 1: 3 wins, 1 loss
		await updateGameStats(ds, 1, 'won', 2);
		await updateGameStats(ds, 1, 'won', 3);
		await updateGameStats(ds, 1, 'won', 5);
		await updateGameStats(ds, 1, 'lost', 7);

		// Iteration 2: 1 win, 2 losses
		await updateGameStats(ds, 2, 'won', 1);
		await updateGameStats(ds, 2, 'lost', 7);
		await updateGameStats(ds, 2, 'lost', 7);

		// Iteration 3: all losses
		await updateGameStats(ds, 3, 'lost', 7);
		await updateGameStats(ds, 3, 'lost', 7);

		const s1 = assertDefined(await getGameStats(ds, 1));
		expect(s1.totalGames).toBe(4);
		expect(s1.wins).toBe(3);
		expect(s1.losses).toBe(1);
		expect(s1.guessDistribution['2']).toBe(1);
		expect(s1.guessDistribution['3']).toBe(1);
		expect(s1.guessDistribution['5']).toBe(1);
		expect(s1.guessDistribution.failed).toBe(1);

		const s2 = assertDefined(await getGameStats(ds, 2));
		expect(s2.totalGames).toBe(3);
		expect(s2.wins).toBe(1);
		expect(s2.losses).toBe(2);

		const s3 = assertDefined(await getGameStats(ds, 3));
		expect(s3.totalGames).toBe(2);
		expect(s3.wins).toBe(0);
		expect(s3.losses).toBe(2);
		expect(s3.guessDistribution.failed).toBe(2);
	});
});

describe('game stats - dynamic maxGuesses support', () => {
	beforeEach(async () => {
		await clearStats();
	});

	test('handles varying guess counts without issues', async () => {
		await updateGameStats(ds, 1, 'won', 7);
		await updateGameStats(ds, 1, 'won', 10);

		const stats = assertDefined(await getGameStats(ds, 1));
		expect(stats.guessDistribution['7']).toBe(1);
		expect(stats.guessDistribution['10']).toBe(1);
		expect(stats.totalGames).toBe(2);
	});
});
