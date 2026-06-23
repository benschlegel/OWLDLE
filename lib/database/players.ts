import type { Dataset } from '@/data/datasets';
import { SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import type { AnswerKey } from '@/types/database';
import { answerCollection, backlogCollection, database, iterationCollection, playerCollection } from './client';

/**
 * CAREFUL: deletes the entire player backlog from database
 */
export async function deleteAllPlayers(dataset: Dataset) {
	return playerCollection.deleteMany({ _id: dataset });
}

export async function dropAll() {
	await database.dropDatabase();
}

/**
 * Drop all data for a single dataset (players, backlog, answers, iterations)
 */
export async function dropDataset(dataset: Dataset) {
	await playerCollection.deleteOne({ _id: dataset });
	await backlogCollection.deleteOne({ _id: dataset });
	await answerCollection.deleteMany({ _id: { $in: [`current_${dataset}`, `next_${dataset}`] as AnswerKey[] } });
	await iterationCollection.deleteMany({ dataset });
}

/**
 * Insert all players from a dataset to the database backlog (if no object with the current dataset id exists, create it, otherwise, update)
 */
export async function insertPlayers(dataset: Dataset) {
	const players = SORTED_PLAYERS.find((p) => p.dataset === dataset)?.players;
	const dbPlayers = players?.map((player) => formattedToDbPlayer(player));
	return playerCollection.updateOne({ _id: dataset }, { $set: { _id: dataset, players: dbPlayers } }, { upsert: true });
}

/**
 * Insert all players from all datasets to the database backlog (if no object with the current dataset id exists, create it, otherwise, update)
 */
export async function insertAllPlayers() {
	for (const playerDataset of SORTED_PLAYERS) {
		const dbPlayers = playerDataset.players.map((player) => formattedToDbPlayer(player));
		await playerCollection.updateOne({ _id: playerDataset.dataset }, { $set: { _id: playerDataset.dataset, players: dbPlayers } }, { upsert: true });
	}
}
