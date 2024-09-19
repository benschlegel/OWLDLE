import { type FormattedPlayer, getRandomPlayer, PLAYERS } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { trimAndAddHours, trimDate } from '@/lib/utils';
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
	DbGameResult,
} from '@/types/database';
import { type ClientSession, MongoClient } from 'mongodb';

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
// TODO: dbClient.connect needed?

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
	await database.dropDatabase();
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
 * @param dataset what dataset to write answer for
 * @param session (optional), pass transaction session if used during transaction
 */
export async function setCurrentAnswer(answer: DbAnswer, dataset: DbDatasetID = season1ID, session?: ClientSession) {
	const answerKey: AnswerKey = `current_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { ...answer, _id: answerKey } }, { upsert: true, session });
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
 * @param dataset what dataset to write answer for
 * @param session (optional), pass transaction session if used during transaction
 */
export async function setNextAnswer(answer: DbAnswer, dataset: DbDatasetID = season1ID, session?: ClientSession) {
	const answerKey: AnswerKey = `next_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { ...answer, _id: answerKey } }, { upsert: true, session });
}

/**
 * Get the answer for a given dataset
 * @param answerPrefix the type of answer to get (e.g. "current" or "next")
 * @param dataset which dataset to get answer for
 */
export async function getAnswer(answerPrefix: DbAnswerPrefix, dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `${answerPrefix}_${dataset}`;
	return answerCollection.findOne({ _id: answerKey });
}

/**
 * Get all answers (e.g. [{_id: "current_dataset"}, {_id: "next_dataset"}]) for given dataset
 */
export async function getAllAnswers(dataset: DbDatasetID = season1ID) {
	return answerCollection.find({ _id: { $regex: `.+_${dataset}` } }).toArray();
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
 * Updates an answer with new player
 * @param answerPrefix "current" or "next"
 * @param player new player to set for answer
 * @param dataset what dataset to set player for
 */
export async function setPartialAnswer(answerPrefix: DbAnswerPrefix, player: DbPlayer, dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `${answerPrefix}_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { player: player } });
}

// TODO: extract random unique player into function, make sure to also update in iteration backlog, if answer is current
/**
 * Updates an answer with new player
 * @param answerPrefix "current" or "next"
 * @param player new player to set for answer
 * @param dataset what dataset to set player for
 * @returns true, if update was rerolled and inserted successfully, false, if not
 */
export async function rerollAnswer(answerPrefix: DbAnswerPrefix, dataset: DbDatasetID = season1ID) {
	const answerKey: AnswerKey = `${answerPrefix}_${dataset}`;
	const randomPlayer = await getUniqueRandomPlayer(dataset);
	if (!randomPlayer) {
		return false;
	}

	// Write player to answer
	try {
		await answerCollection.updateOne({ _id: answerKey }, { $set: { player: randomPlayer } }, { upsert: true });
	} catch (e) {
		return false;
	}

	if (answerPrefix === 'current') {
		const iteration = await getCurrentIteration(dataset);
		if (iteration === undefined) return false;

		// Do partial update on backlog iteration
		return updateIterationPlayer(iteration, randomPlayer);
	}

	return true;
}

/**
 * Pick random unqiue player that isn't in any backlog (answers or main backlog)
 * @param dataset what dataset to get unqiue player for
 */
export async function getUniqueRandomPlayer(dataset: DbDatasetID) {
	let randomPlayer = getRandomPlayer();
	let isIncluded = true;

	// Get other answer + backlog to compare against
	const answers = await getAllAnswers(dataset);

	const backlog = (await getBacklog(dataset))?.players;
	if (!backlog) return;

	while (isIncluded) {
		const isIncludedBacklog = backlog.some((player) => player.name === randomPlayer.name);
		const isAnswersIncluded = answers.some((player) => player.player.name === randomPlayer.name);
		if (isIncludedBacklog === false && isAnswersIncluded === false) {
			isIncluded = false;
		} else {
			randomPlayer = getRandomPlayer();
		}
	}

	return formattedToDbPlayer(randomPlayer);
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
 * Add new iteration to full iteration store
 * @param it which iteration to store
 */
export async function addIteration(it: DbIteration, session?: ClientSession) {
	return iterationCollection.insertOne(it, { session });
}

/**
 * Update player in logged iterations (e.g. when re-shuffling)
 * @param iteration what iteration to overwrite
 * @param player new player to replace old one with
 */
export async function updateIterationPlayer(iteration: DbIteration['iteration'], player: DbIteration['player']) {
	return iterationCollection.updateOne({ iteration: iteration }, { $set: { player: player } });
}

export async function getBacklog(dataset: DbDatasetID = season1ID) {
	return backlogCollection.findOne({ _id: dataset });
}

/**
 * Generates and overwrites the existing backlog for a dataset.
 * Defaults to use backlog size from game config.
 *
 * Calling it with (30, "season1") would override the entry with id "season1" in the "backlog" collection to use the newly generated backlog.
 *
 * @param size what size to generate the backlog (e.g. 30 overrides and generates 30 new entries)
 * @param dataset what dataset to generate backlog for
 * @param session (optional), pass transaction session if used during transaction
 */
export async function generateBacklog(size: number = GAME_CONFIG.backlogMaxSize, dataset: DbDatasetID = season1ID, session?: ClientSession) {
	// TODO: ensure that none of new backlog entries in answers
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
 * Pops backlog (removes and returns first element)
 * @param dataset what dataset to pop backlog for
 * @param session (optional), pass transaction session if used during transaction
 * @returns an object containing the popped item and the new length of the array
 */
export async function popBacklog(dataset: DbDatasetID = season1ID, session?: ClientSession) {
	// Use aggregation to get the first item and array length (combines .findOne and aggregate for length)
	const aggregationResult = await backlogCollection
		.aggregate(
			[
				{ $match: { _id: dataset } },
				{
					$project: {
						firstPlayer: { $arrayElemAt: ['$players', 0] },
						originalLength: { $size: '$players' },
					},
				},
			],
			{ session }
		)
		.toArray();

	// Early return, if array could not be popped.
	if (!aggregationResult.length || aggregationResult[0].originalLength === 0) {
		return { poppedPlayer: undefined, newLength: 0 };
	}

	const { firstPlayer, originalLength } = aggregationResult[0];

	// Remove the first item from the array
	await backlogCollection.updateOne({ _id: dataset }, { $pop: { players: -1 } }, { session });

	const newLength = originalLength - 1;

	return { poppedPlayer: firstPlayer, newLength };
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
export async function logGame(gameData: DbGuess[], gameResult: DbGameResult, dataset: DbDatasetID = season1ID) {
	if (gameData.length > 0) {
		// Get current iteration
		const currIteration = await getCurrentIteration();
		if (currIteration && currIteration > 0) {
			return gameLogCollection.insertOne({ iteration: currIteration, dataset: dataset, gameData: gameData, gameResult: gameResult });
		}
		Promise.reject(new Error('Could not get current iteration from db.'));
	}
}

/**
 * Wrapper that handles going to the next iteration (if resetDate was reached)
 * Works as a transaction, either everything gets rolled over to next iteration or everything fails
 * @param nextResetHours hours until next reset
 */
export async function goNextIteration(
	nextResetHours: number = GAME_CONFIG.nextResetHours,
	dataset: DbDatasetID = 'OWL_season1',
	backlogSize: number = GAME_CONFIG.backlogMaxSize
) {
	// * Prep: get current answer from db, error out if not working
	const currentAnswer = await getCurrentAnswer();
	const nextAnswer = await getNextAnswer();
	if (!currentAnswer || !nextAnswer) {
		throw new Error('Could not get current answers from database.');
	}

	// Prepare data
	const nextIterationId = currentAnswer.iteration + 1;
	const now = trimDate(new Date());
	const nextResetDate = trimAndAddHours(now, nextResetHours);
	const nextAnswerData: DbAnswer = { iteration: nextIterationId, nextReset: nextResetDate, player: nextAnswer.player };

	try {
		// * Set next answer to current answer
		await setCurrentAnswer(nextAnswerData, dataset);

		// * Log new iteration to db
		await addIteration({ dataset: dataset, iteration: nextIterationId, player: nextAnswerData.player, resetAt: now });

		// * Get next player from backlog
		const poppedData = await popBacklog(dataset);
		if (!poppedData || poppedData.poppedPlayer === undefined) {
			throw new Error('Could not get player from backlog');
		}

		const newPlayer = poppedData.poppedPlayer;
		const newLength = poppedData.newLength;

		// * Generate and set new nextAnswer
		const nextAnswerIteration = nextIterationId + 1;
		const nextAnswerReset = trimAndAddHours(nextResetDate, nextResetHours);
		const answerRes = await setNextAnswer({ iteration: nextAnswerIteration, nextReset: nextAnswerReset, player: newPlayer }, dataset);
		if (!answerRes.acknowledged) {
			throw new Error('Failed to set new answer');
		}

		// * If new backlog is empty, regenerate it
		if (newLength === 0) {
			const backlogRes = await generateBacklog(backlogSize, dataset);
			if (!backlogRes.acknowledged) {
				throw new Error('Failed to regenerate backlog');
			}
		}
	} catch (error) {
		console.error('Operation failed:', error);
		throw error; // Re-throw the error to be handled by the caller
	}

	// step 1: get current answer
	// step 2: increment iteration
	// step 3: set new current to old next
	// step 4: log new current
	// step 5: pop backlog
	// step 5.5: regenerate backlog, if necessary
	// step 6: set new next answer
}
