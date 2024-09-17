import { PLAYERS } from '@/data/players/formattedPlayers';
import type { DbFormattedPlayers } from '@/types/database';
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
export const answerCollectionName = 'currentAnswer';
export const playerCollectionName = 'players';
const season1ID = 'season1';
const answerID = 'today';

// Use connect method to connect to the server
const dbClient = new MongoClient(uri);
const database = dbClient.db(dbName);

// Define collections

const playerCollection = database.collection<DbFormattedPlayers>(playerCollectionName);

export async function insertPlayer(): Promise<void> {
	// const result = await playerCollection.insertMany(PLAYERS).then(() => console.log('Saved to db!'));
}

export async function deleteAllPlayers() {
	await playerCollection.deleteMany({});
}

export async function insertAllPlayers() {
	await playerCollection.updateOne({ _id: season1ID }, { $set: { _id: season1ID, players: PLAYERS } }, { upsert: true });
}
// const reminderCollection = database.collection<CreateReminder>(collectionNameReminders);
// const metricCollection = database.collection<Userbase>(collectionNameMetrics);
