/**
 * Characterization tests for goNextIteration (daily cron reset path).
 */
import { describe, expect, test, beforeEach } from 'vitest';
import {
	goNextIteration,
	setCurrentAnswer,
	setNextAnswer,
	getCurrentAnswer,
	getNextAnswer,
	getBacklog,
	dbName,
	playerCollectionName,
	backlogCollectionName,
	answerCollectionName,
	iterationsCollectionName,
} from '@/lib/databaseAccess';
import type { Dataset } from '@/data/datasets';
import type { DbAnswer, DbPlayer } from '@/types/database';
import { GAME_CONFIG } from '@/lib/config';
import { MongoClient } from 'mongodb';
import { trimAndAddHours, trimDate } from '@/lib/utils';

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
		await Promise.all([
			db.collection(playerCollectionName).deleteMany({}),
			db.collection(backlogCollectionName).deleteMany({}),
			db.collection(answerCollectionName).deleteMany({}),
			db.collection(iterationsCollectionName).deleteMany({}),
		]);
	} finally {
		await client.close();
	}
}

function assertDefined<T>(value: T | null | undefined, msg = 'Expected non-null'): T {
	expect(value, msg).not.toBeNull();
	expect(value, msg).not.toBeUndefined();
	return value as T;
}

/** Build a minimal DbPlayer with the given id/name. Team is set to a value not in disabledTeams. */
function makePlayer(id: number, name: string): DbPlayer {
	return {
		name,
		id,
		role: 'Damage',
		team: 'Boston Uprising',
		country: 'US',
		region: 'NA',
	} as unknown as DbPlayer;
}

/**
 * Seed the player collection + backlog collection for a dataset.
 * generateBacklog (called when backlog empties) reads from playerCollection,
 * so we need real players there.
 */
async function seedPlayersAndBacklog(dataset: Dataset, players: DbPlayer[], backlogPlayers: DbPlayer[]) {
	const client = getClient();
	try {
		await client.connect();
		const db = client.db(dbName);
		await db.collection(playerCollectionName).updateOne({ _id: dataset as any }, { $set: { _id: dataset, players } }, { upsert: true });
		await db.collection(backlogCollectionName).updateOne({ _id: dataset as any }, { $set: { _id: dataset, players: backlogPlayers } }, { upsert: true });
	} finally {
		await client.close();
	}
}

describe('cron reset — goNextIteration', () => {
	beforeEach(async () => {
		await clearAll();
	});

	// Case 1: Happy path
	test('happy path: increments iteration, advances current to previous next, pops backlog', async () => {
		const now = trimDate(new Date());
		const nextReset = trimAndAddHours(now, 24);

		const playerA = makePlayer(1, 'PlayerA');
		const playerB = makePlayer(2, 'PlayerB');
		const playerC = makePlayer(3, 'PlayerC');

		// Seed player collection with enough players for backlog regeneration
		const allPlayers = Array.from({ length: 25 }, (_, i) => makePlayer(100 + i, `BulkPlayer${i}`));

		// Seed backlog with multiple players (more than 1 so it doesn't immediately trigger regen)
		const backlogPlayers = [playerC, ...Array.from({ length: 3 }, (_, i) => makePlayer(10 + i, `BacklogExtra${i}`))];

		await seedPlayersAndBacklog(ds, [...allPlayers, playerA, playerB, playerC, ...backlogPlayers], backlogPlayers);

		const currentAnswer: DbAnswer = { iteration: 1, nextReset, player: playerA };
		const nextAnswer: DbAnswer = { iteration: 2, nextReset: trimAndAddHours(nextReset, 24), player: playerB };
		await setCurrentAnswer(currentAnswer, ds);
		await setNextAnswer(nextAnswer, ds);

		const backlogBefore = assertDefined(await getBacklog(ds), 'backlog before');
		const backlogLengthBefore = backlogBefore.players.length;

		await goNextIteration(24, ds, GAME_CONFIG.backlogMaxSize);

		const newCurrent = assertDefined(await getCurrentAnswer(ds), 'new current answer');

		// iteration incremented by 1
		expect(newCurrent.iteration).toBe(2);

		// current answer's player is now the previous next answer's player
		expect(newCurrent.player.name).toBe(playerB.name);

		// backlog shrank by one
		const backlogAfter = assertDefined(await getBacklog(ds), 'backlog after');
		expect(backlogAfter.players.length).toBe(backlogLengthBefore - 1);
	});

	// Case 2: Backlog regeneration when it reaches empty
	test('backlog is regenerated when it empties after the pop', async () => {
		const now = trimDate(new Date());
		const nextReset = trimAndAddHours(now, 24);

		const playerA = makePlayer(1, 'PlayerA');
		const playerB = makePlayer(2, 'PlayerB');
		// Seed backlog with exactly 1 player so after the pop the backlog is empty
		const backlogPlayers = [makePlayer(3, 'PlayerC')];

		// Seed playerCollection with enough players for generateBacklog to draw from
		const bulkPlayers = Array.from({ length: 30 }, (_, i) => makePlayer(200 + i, `BulkRegen${i}`));

		await seedPlayersAndBacklog(ds, [...bulkPlayers, playerA, playerB, ...backlogPlayers], backlogPlayers);

		const currentAnswer: DbAnswer = { iteration: 1, nextReset, player: playerA };
		const nextAnswer: DbAnswer = { iteration: 2, nextReset: trimAndAddHours(nextReset, 24), player: playerB };
		await setCurrentAnswer(currentAnswer, ds);
		await setNextAnswer(nextAnswer, ds);

		await goNextIteration(24, ds, GAME_CONFIG.backlogMaxSize);

		// After the pop the backlog was empty and should have been regenerated
		const backlogAfter = assertDefined(await getBacklog(ds), 'backlog after regen');
		expect(backlogAfter.players.length).toBeGreaterThan(0);
	});

	// Case 3: Missing-answer guard — throws when no current/next answer is seeded
	test('throws when current or next answer is missing', async () => {
		// No answers seeded at all
		await expect(goNextIteration(24, ds, GAME_CONFIG.backlogMaxSize)).rejects.toThrow();
	});

	// Case 3b: throws when only current answer is present (no next answer)
	test('throws when next answer is missing', async () => {
		const now = trimDate(new Date());
		const nextReset = trimAndAddHours(now, 24);
		const playerA = makePlayer(1, 'PlayerA');
		await setCurrentAnswer({ iteration: 1, nextReset, player: playerA }, ds);
		// No next answer set

		await expect(goNextIteration(24, ds, GAME_CONFIG.backlogMaxSize)).rejects.toThrow();
	});
});
