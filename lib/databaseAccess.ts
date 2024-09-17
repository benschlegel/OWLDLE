import { PLAYERS } from '@/data/players/formattedPlayers';
import type { DbAnswer, DbFormattedPlayers } from '@/types/database';
import { MongoClient, WithId } from 'mongodb';

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
export const currentAnswerCollectionName = 'currentAnswer';
export const nextAnswerCollectionName = 'nextAnswer';
export const playerCollectionName = 'players';
const season1ID = 'season1';
const currentAnswerID = 'current';
const nextAnswerID = 'next';

// Use connect method to connect to the server
const dbClient = new MongoClient(uri);
const database = dbClient.db(dbName);

// Define collections

const playerCollection = database.collection<DbFormattedPlayers>(playerCollectionName);
const currentAnswerCollection = database.collection<DbFormattedPlayers>(currentAnswerCollectionName);
const nextCollection = database.collection<DbFormattedPlayers>(nextAnswerCollectionName);

export async function insertPlayer(): Promise<void> {
	// const result = await playerCollection.insertMany(PLAYERS).then(() => console.log('Saved to db!'));
}

/**
 * CAREFUL: deletes the entire player backlog from database
 */
export async function deleteAllPlayers() {
	return playerCollection.deleteMany({ _id: season1ID });
}

/**
 * Insert all players from a season to the database backlog (if no object with the current season id exists, create it, otherwise, update)
 */
export async function insertAllPlayers() {
	return playerCollection.updateOne({ _id: season1ID }, { $set: { _id: season1ID, players: PLAYERS } }, { upsert: true });
}

/**
 * Sets the current game answer
 * @param answer the answer that's currently correct
 */
export async function setCurrentAnswer(answer: DbAnswer) {
	return currentAnswerCollection.updateOne({ _id: currentAnswerID }, { $set: { ...answer, _id: currentAnswerID } }, { upsert: true });
}
