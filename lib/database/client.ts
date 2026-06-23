import type { Dataset } from '@/data/datasets';
import type {
	DbAnswerFull,
	DbFeedback,
	DbFormattedPlayers,
	DbGameStats,
	DbIteration,
	DbLoggedEndlessSession,
	DbLoggedGame,
} from '@/types/database';
import { MongoClient } from 'mongodb';

let useDevDatabase = false;
if (process.env.NODE_ENV !== 'production') {
	useDevDatabase = true;
}

const uri = process.env.MONGO_URI;
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
export const iterationsCollectionName = 'iterations';
export const endlessLogCollectionName = 'endless_game_logs';
const season1ID: Dataset = 'season1';
const gameLogs = 'game_logs';
const iterationsId = iterationsCollectionName;
const feedbackID = 'feedback';

// Use connect method to connect to the server
export const dbClient = new MongoClient(uri);
export const database = dbClient.db(dbName);
// TODO: dbClient.connect needed?

// Define collections
// TODO: add array with dataset as key and collections as value, dynamically generate
export const playerCollection = database.collection<DbFormattedPlayers>(playerCollectionName);
export const answerCollection = database.collection<DbAnswerFull>(answerCollectionName);
export const backlogCollection = database.collection<DbFormattedPlayers>(backlogCollectionName);
export const feedbackCollection = database.collection<DbFeedback>(feedbackID);
export const gameLogCollection = database.collection<DbLoggedGame>(gameLogs);

export const iterationCollection = database.collection<DbIteration>(iterationsId);
iterationCollection.createIndex({ iteration: 1, dataset: 1 }, { unique: true });

export const endlessLogCollection = database.collection<DbLoggedEndlessSession>(endlessLogCollectionName);
endlessLogCollection.createIndex({ dataset: 1, name: 1, streakLength: -1 });

export const gameStatsCollection = database.collection<DbGameStats>('game_stats');
gameStatsCollection.createIndex({ dataset: 1, iteration: 1 }, { unique: true });
