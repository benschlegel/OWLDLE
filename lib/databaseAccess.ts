import { PLAYERS } from '@/data/players/formattedPlayers';
import type { DbAnswer, DbAnswerFull, DbFormattedPlayers, DbSeasons } from '@/types/database';
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
export const answerCollectionName = 'answers';
export const playerCollectionName = 'players';
const season1ID: DbSeasons = 'season1';
const currentAnswerID = 'current';
const nextAnswerID = 'next';

// Use connect method to connect to the server
const dbClient = new MongoClient(uri);
const database = dbClient.db(dbName);

// Define collections

const playerCollection = database.collection<DbFormattedPlayers>(playerCollectionName);
const answersCollection = database.collection<DbAnswerFull>(answerCollectionName);

export async function insertPlayer(): Promise<void> {
	// const result = await playerCollection.insertMany(PLAYERS).then(() => console.log('Saved to db!'));
}

/**
 * CAREFUL: deletes the entire player backlog from database
 */
export async function deleteAllPlayers(season: DbSeasons = season1ID) {
	return playerCollection.deleteMany({ _id: season });
}

/**
 * Insert all players from a season to the database backlog (if no object with the current season id exists, create it, otherwise, update)
 */
export async function insertAllPlayers(season: DbSeasons = season1ID) {
	return playerCollection.updateOne({ _id: season }, { $set: { _id: season, players: PLAYERS } }, { upsert: true });
}

/**
 * Sets the current game answer
 * @param answer the answer that's currently correct
 */
export async function setCurrentAnswer(answer: DbAnswer) {
	return answersCollection.updateOne({ _id: currentAnswerID }, { $set: { ...answer, _id: currentAnswerID } }, { upsert: true });
}

/**
 * Sets the next game answer (e.g. for tomorrow)
 * @param answer the correct answer for the next iteration
 */
export async function setNextAnswer(answer: DbAnswer) {
	return answersCollection.updateOne({ _id: nextAnswerID }, { $set: { ...answer, _id: nextAnswerID } }, { upsert: true });
}

// TODO: add "playerPool" collection to pick next answers from
// TODO: add game statistics collection (with date as key)
