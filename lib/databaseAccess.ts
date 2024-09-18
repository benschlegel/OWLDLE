import { type FormattedPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import type { DbAnswer, DbAnswerFull, DbFormattedPlayers, DbPlayer, DbSeasons } from '@/types/database';
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
const season1ID: DbSeasons = 'season1';
const currentAnswerID = 'current';
const nextAnswerID = 'next';

// Use connect method to connect to the server
const dbClient = new MongoClient(uri);
const database = dbClient.db(dbName);

// Define collections

const playerCollection = database.collection<DbFormattedPlayers>(playerCollectionName);
const answersCollection = database.collection<DbAnswerFull>(answerCollectionName);
const backlogCollection = database.collection<DbFormattedPlayers>(backlogCollectionName);

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
	const dbPlayers = PLAYERS.map((player) => formattedToDbPlayer(player));
	return playerCollection.updateOne({ _id: season }, { $set: { _id: season, players: dbPlayers } }, { upsert: true });
}

/**
 * Sets the current game answer
 * IMPORTANT: make sure the player does not contain countryImg field
 * @param answer the answer that's currently correct
 */
export async function setCurrentAnswer(answer: DbAnswer) {
	return answersCollection.updateOne({ _id: currentAnswerID }, { $set: { ...answer, _id: currentAnswerID } }, { upsert: true });
}

/**
 * Sets the next game answer (e.g. for tomorrow)
 * IMPORTANT: make sure the player does not contain countryImg field
 * @param answer the correct answer for the next iteration
 */
export async function setNextAnswer(answer: DbAnswer) {
	return answersCollection.updateOne({ _id: nextAnswerID }, { $set: { ...answer, _id: nextAnswerID } }, { upsert: true });
}

/**
 * Generates and overwrites the existing backlog for a season.
 * Defaults to use backlog size from game config.
 *
 * Calling it with (30, "season1") would override the entry with id "season1" in the "backlog" collection to use the newly generated backlog.
 *
 * @param size what size to generate the backlog (e.g. 30 overrides and generates 30 new entries)
 */
export async function generateBacklog(size: number = GAME_CONFIG.backlogMaxSize, season: DbSeasons = season1ID) {
	// Error if player collection is emtpy
	const playerCount = await playerCollection.countDocuments();
	if (playerCount === 0) throw new Error("players collection empty, can't generate backlog");

	// Get all players and pick random (unique) sample
	const seasonPlayers = await playerCollection.findOne({ _id: season });
	if (!seasonPlayers) throw new Error(`can't find players collection for ${season}`);

	// Apply Fisher-Yates shuffle
	const players = seasonPlayers.players;
	for (let i = players.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[players[i], players[j]] = [players[j], players[i]];
	}

	// Get slice with specified size
	const slicedPlayers: DbPlayer[] = players.slice(0, size);

	return backlogCollection.updateOne({ _id: season }, { $set: { _id: season, players: slicedPlayers } }, { upsert: true });
}

/**
 * Insert one player to the start of the backlog
 * @param player player to insert
 * @param season what season to insert backlog (defaults to season1)
 */
export async function insertOneBacklog(player: DbPlayer, season: DbSeasons = season1ID) {
	return backlogCollection.updateOne({ _id: season }, { $push: { players: { $each: [player], $position: 0 } } }, { upsert: true });
}

/**
 * Insert many players to the start of the backlog
 * @param player player to insert
 * @param season what season to insert backlog (defaults to season1)
 */
export async function insertManyBacklog(players: DbPlayer[], season: DbSeasons = season1ID) {
	return backlogCollection.updateOne({ _id: season }, { $push: { players: { $each: players, $position: 0 } } }, { upsert: true });
}

// TODO: add "playerPool" collection to pick next answers from
// TODO: add game statistics collection (with date as key)
