import { describe, expect, test, beforeEach } from 'vitest';
import { logEndlessSession, getLeaderboard, dbName, endlessLogCollectionName } from '@/lib/databaseAccess';
import type { Dataset } from '@/data/datasets';
import type { DbEndlessGameEntry } from '@/types/database';
import { endlessSaveValidator } from '@/types/database';
import { GAME_CONFIG } from '@/lib/config';
import { MongoClient } from 'mongodb';

const ds: Dataset = 'season1';

function getClient() {
	const uri = process.env.MONGO_URI;
	if (!uri) throw new Error('MONGO_URI not set');
	return new MongoClient(uri);
}

async function clearAll() {
	const client = getClient();
	try {
		await client.connect();
		const db = client.db(dbName);
		await db.collection(endlessLogCollectionName).deleteMany({});
	} finally {
		await client.close();
	}
}

function assertDefined<T>(value: T | null | undefined, msg = 'Expected non-null'): T {
	expect(value, msg).not.toBeNull();
	expect(value, msg).not.toBeUndefined();
	return value as T;
}

/** Minimum streak that qualifies for the leaderboard */
const minStreak = GAME_CONFIG.minLeaderboardStreak;

/** A valid games array for a streak of given length */
function makeGames(count: number): DbEndlessGameEntry[] {
	return Array.from({ length: count }, (_, i) => ({
		guessCount: 3,
		result: 'won' as const,
		completedAt: Date.now() + i * 1000,
	}));
}

describe('endless leaderboard — logEndlessSession + getLeaderboard', () => {
	beforeEach(async () => {
		await clearAll();
	});

	// Case 1: first submission inserts; getLeaderboard returns it
	test('first submission inserts and appears on leaderboard', async () => {
		await logEndlessSession(ds, minStreak, makeGames(minStreak), undefined, 'Alice', 'client-001');

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		expect(total).toBe(1);
		expect(entries[0].name).toBe('Alice');
		expect(entries[0].streakLength).toBe(minStreak);
	});

	// Case 2: higher streak replaces; leaderboard shows the higher one
	test('higher streak replaces existing entry', async () => {
		await logEndlessSession(ds, minStreak, makeGames(minStreak), undefined, 'Bob', 'client-002');
		await logEndlessSession(ds, minStreak + 3, makeGames(minStreak + 3), undefined, 'Bob', 'client-002');

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		expect(total).toBe(1);
		expect(entries[0].streakLength).toBe(minStreak + 3);
		expect(entries[0].name).toBe('Bob');
	});

	// Case 3: lower streak does not lower the existing entry
	test('lower streak submission does not overwrite existing higher streak', async () => {
		await logEndlessSession(ds, minStreak + 5, makeGames(minStreak + 5), undefined, 'Carol', 'client-003');
		await logEndlessSession(ds, minStreak, makeGames(minStreak), undefined, 'Carol', 'client-003');

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		// Still one deduped entry for this clientId
		expect(total).toBe(1);
		expect(entries[0].streakLength).toBe(minStreak + 5);
	});

	// Case 4: lower-streak submission with a name updates the displayed name
	test('lower-streak submission with name updates displayed name on existing entry', async () => {
		await logEndlessSession(ds, minStreak + 5, makeGames(minStreak + 5), undefined, undefined, 'client-004');
		await logEndlessSession(ds, minStreak, makeGames(minStreak), undefined, 'Dave', 'client-004');

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		expect(total).toBe(1);
		expect(entries[0].streakLength).toBe(minStreak + 5);
		expect(entries[0].name).toBe('Dave');
		// anonymous flag should be cleared after explicit name submission
		expect(entries[0].anonymous).toBeFalsy();
	});

	// Case 5: two different clientIds both appear, ordered by streak
	test('two different clientIds both appear, ordered by streak descending', async () => {
		await logEndlessSession(ds, minStreak, makeGames(minStreak), undefined, 'Eve', 'client-005a');
		await logEndlessSession(ds, minStreak + 2, makeGames(minStreak + 2), undefined, 'Frank', 'client-005b');

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		expect(total).toBe(2);
		expect(entries[0].name).toBe('Frank');
		expect(entries[0].streakLength).toBe(minStreak + 2);
		expect(entries[1].name).toBe('Eve');
		expect(entries[1].streakLength).toBe(minStreak);
	});

	// Case 6: entries below minLeaderboardStreak are excluded from the leaderboard
	test('entries below minLeaderboardStreak are excluded from leaderboard', async () => {
		// streak below threshold (minStreak - 1, but only if that is >= 1)
		const belowThreshold = Math.max(1, minStreak - 1);
		await logEndlessSession(ds, belowThreshold, makeGames(belowThreshold), undefined, 'Ghost', 'client-006');

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		expect(total).toBe(0);
		expect(entries).toHaveLength(0);
	});

	// Case: anonymous submission stores a generated streamer name
	test('anonymous submission stores a generated streamer name', async () => {
		await logEndlessSession(ds, minStreak, makeGames(minStreak), undefined, undefined, 'client-007', true);

		const { entries, total } = await getLeaderboard(ds, 1, 10, 500);
		expect(total).toBe(1);
		// anonymous entries appear on leaderboard (anonymous: true branch in $or)
		expect(entries[0].anonymous).toBe(true);
		// name should be a generated streamer name (non-empty string)
		expect(typeof entries[0].name).toBe('string');
		expect((entries[0].name as string).length).toBeGreaterThan(0);
	});
});

describe('endless leaderboard — endlessSaveValidator (pure)', () => {
	// Case 6a: rejects streakLength: 0
	test('rejects streakLength 0', () => {
		const result = endlessSaveValidator.safeParse({
			streakLength: 0,
			games: [{ guessCount: 3, result: 'won', completedAt: Date.now() }],
		});
		expect(result.success).toBe(false);
	});

	// Case 6b: rejects games entry with guessCount: 0
	test('rejects games entry with guessCount 0', () => {
		const result = endlessSaveValidator.safeParse({
			streakLength: 1,
			games: [{ guessCount: 0, result: 'won', completedAt: Date.now() }],
		});
		expect(result.success).toBe(false);
	});

	// Case 6c: accepts a valid payload
	test('accepts a valid payload', () => {
		const result = endlessSaveValidator.safeParse({
			streakLength: 5,
			games: [
				{ guessCount: 3, result: 'won', completedAt: Date.now() },
				{ guessCount: 1, result: 'won', completedAt: Date.now() + 1000 },
			],
			name: 'ValidName',
			clientId: '550e8400-e29b-41d4-a716-446655440000',
		});
		expect(result.success).toBe(true);
	});

	// Additional: rejects empty games array
	test('rejects empty games array', () => {
		const result = endlessSaveValidator.safeParse({
			streakLength: 1,
			games: [],
		});
		expect(result.success).toBe(false);
	});
});
