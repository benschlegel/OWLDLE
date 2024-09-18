import { type FormattedPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import type {
	AnswerKey,
	DbAnswer,
	DbAnswerFull,
	DbAnswerPrefix,
	DbFormattedPlayers,
	DbPlayer,
	DbDatasetID,
	DbLogEntryKey,
	DbFeedback,
	DbIteration,
	DbLoggedGame,
	DbGuess,
} from '@/types/database';
import { MongoClient } from 'mongodb';

let useDevDatabase = false;
if (process.env.NODE_ENV !== 'production') {
	useDevDatabase = true;
}

const uri = globalThis.process.env.MONGO_URI;
if (!uri) {
	throw new Error('MONGO_URI not found! Make sure to set MONGO_URI in your .env');
}

// Define db constants (collection names, etc)
const PROD_NAME = 'OWLEL';
const DEV_NAME = 'OWLEL-dev';
export const dbName = !useDevDatabase ? PROD_NAME : DEV_NAME;
export const answerCollectionName = 'answers';
export const playerCollectionName = 'players';
export const backlogCollectionName = 'backlog';
const season1ID: DbDatasetID = 'OWL_season1';
const gameLogs = 'game_logs';
const iterationsId = 'iterations';
const feedbackID = 'feedback';

// Use connect method to connect to the server
const dbClient = new MongoClient(uri);
const database = dbClient.db(dbName);

// Define collections
// TODO: add array with dataset as key and collections as value, dynamically generate
const playerCollection = database.collection<DbFormattedPlayers>(playerCollectionName);
const answerCollection = database.collection<DbAnswerFull>(answerCollectionName);
const backlogCollection = database.collection<DbFormattedPlayers>(backlogCollectionName);
const feedbackCollection = database.collection<DbFeedback>(feedbackID);
const gameLogCollection = database.collection<DbLoggedGame>(gameLogs);

const iterationCollection = database.collection<DbIteration>(iterationsId);
iterationCollection.createIndex({ iteration: 1 }, { unique: true });

/**
 * CAREFUL: deletes the entire player backlog from database
 */
export async function deleteAllPlayers(dataset: DbDatasetID = season1ID) {
	return playerCollection.deleteMany({ _id: dataset });
}

export async function dropAll() {
	if (process.env.NODE_ENV !== 'production') {
		await database.dropDatabase();
	}
}

/**
 * Insert all players from a dataset to the database backlog (if no object with the current dataset id exists, create it, otherwise, update)
 */
export async function insertAllPlayers(dataset: DbDatasetID = season1ID) {
	const dbPlayers = PLAYERS.map((player) => formattedToDbPlayer(player));
	return playerCollection.updateOne({ _id: dataset }, { $set: { _id: dataset, players: dbPlayers } }, { upsert: true });
}

/**
 * Sets the current game answer
 * IMPORTANT: make sure the player does not contain countryImg field
 * @param answer the answer that's currently correct
 */
export async function setCurrentAnswer(answer: DbAnswer, dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `current_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { ...answer, _id: answerKey } }, { upsert: true });
}

/**
 * Get current answer from db
 * @param dataset which dataset to get current answer for
 */
export async function getCurrentAnswer(dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `current_${dataset}`;
	return answerCollection.findOne({ _id: answerKey });
}

/**
 * Sets the next game answer (e.g. for tomorrow)
 * IMPORTANT: make sure the player does not contain countryImg field
 * @param answer the correct answer for the next iteration
 */
export async function setNextAnswer(answer: DbAnswer, dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `next_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { ...answer, _id: answerKey } }, { upsert: true });
}

/**
 * Get current answer from db
 * @param dataset which dataset to get current answer for
 */
export async function getNextAnswer(dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `next_${dataset}`;
	return answerCollection.findOne({ _id: answerKey });
}

/**
 * Get current iteration for dataset
 * @param dataset which dataset to get current iteration for
 */
export async function getCurrentIteration(dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `current_${dataset}`;
	const iterationRes = await answerCollection.findOne({ _id: answerKey }, { projection: { iteration: 1, _id: 0 } });
	return iterationRes?.iteration;
}

/**
 * Generates and overwrites the existing backlog for a dataset.
 * Defaults to use backlog size from game config.
 *
 * Calling it with (30, "season1") would override the entry with id "season1" in the "backlog" collection to use the newly generated backlog.
 *
 * @param size what size to generate the backlog (e.g. 30 overrides and generates 30 new entries)
 */
export async function generateBacklog(size: number = GAME_CONFIG.backlogMaxSize, dataset: DbDatasetID = season1ID) {
	// Error if player collection is emtpy
	const playerCount = await playerCollection.countDocuments();
	if (playerCount === 0) throw new Error("players collection empty, can't generate backlog");

	// Get all players and pick random (unique) sample
	const seasonPlayers = await playerCollection.findOne({ _id: dataset });
	if (!seasonPlayers) throw new Error(`can't find players collection for ${dataset}`);

	// Apply Fisher-Yates shuffle
	const players = seasonPlayers.players;
	for (let i = players.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[players[i], players[j]] = [players[j], players[i]];
	}

	// Get slice with specified size
	const slicedPlayers: DbPlayer[] = players.slice(0, size);

	return backlogCollection.updateOne({ _id: dataset }, { $set: { _id: dataset, players: slicedPlayers } }, { upsert: true });
}

/**
 * Insert one player to the start of the backlog
 * @param player player to insert
 * @param dataset what dataset to insert backlog (defaults to season1)
 */
export async function insertOneBacklog(player: DbPlayer, dataset: DbDatasetID = season1ID) {
	return backlogCollection.updateOne({ _id: dataset }, { $push: { players: { $each: [player], $position: 0 } } }, { upsert: true });
}

/**
 * Insert many players to the start of the backlog
 * @param player player to insert
 * @param dataset what dataset to insert backlog (defaults to season1)
 */
export async function insertManyBacklog(players: DbPlayer[], dataset: DbDatasetID = season1ID) {
	return backlogCollection.updateOne({ _id: dataset }, { $push: { players: { $each: players, $position: 0 } } }, { upsert: true });
}

/**
 * Add website feedback to db
 */
export async function addFeedback(feedback: DbFeedback) {
	return feedbackCollection.insertOne(feedback);
}

/**
 * Log game state to db
 * @param dataset
 */
export async function logGame(gameData: DbGuess[], dataset: DbDatasetID = season1ID) {
	if (gameData.length > 0) {
		// Get current iteration
		const currIteration = await getCurrentIteration();
		if (currIteration && currIteration > 0) {
			return gameLogCollection.insertOne({ iteration: currIteration, dataset: dataset, gameData: gameData });
		}
		Promise.reject(new Error('Could not get current iteration from db.'));
	}
}

/**
 * Add new iteration to full iteration store
 * @param it which iteration to store
 */
export async function addIteration(it: DbIteration) {
	return iterationCollection.insertOne(it);
}

// TODO: add game statistics collection (with date as key)
// TODO: reset: -add new iteration to iterations immediatly, -set next/current, -check if backlog needs regen
