import type { Dataset } from '@/data/datasets';
import { getDisabledTeams } from '@/data/disabledTeams';
import type {
	DbFormattedPlayers,
	DbPlayer,
} from '@/types/database';
import type { ClientSession } from 'mongodb';
import { answerCollection, backlogCollection, playerCollection } from './client';

/**
 * Get backlog for a given dataset
 * @param dataset what dataset to get backlog for
 */
export async function getBacklog(dataset: Dataset) {
	return backlogCollection.findOne({ _id: dataset });
}

/**
 * Set/overwrite backlog for given dataset
 * @param backlog what dataset to
 */
export async function setBacklog(backlog: DbFormattedPlayers) {
	return backlogCollection.updateOne({ _id: backlog._id }, { $set: { players: backlog.players } });
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
export async function generateBacklog(size: number, dataset: Dataset, session?: ClientSession, invalidPlayers: string[] = []) {
	// Error if player collection is emtpy
	const playerCount = await playerCollection.countDocuments();
	if (playerCount === 0) throw new Error("players collection empty, can't generate backlog");

	// Get all players and pick random (unique) sample
	const seasonPlayers = await playerCollection.findOne({ _id: dataset });
	if (!seasonPlayers) throw new Error(`can't find players collection for ${dataset}`);

	// * Remove players from sampled players to make sure newly sampled backlog doesn't contain duplicates
	const answers = await answerCollection.find({ _id: { $regex: `.+_${dataset}` } }).toArray();

	// Check if answers exist. If they do, remove their entries
	const invalidPlayerNames: string[] = [];
	for (const answer of answers) {
		if (answer !== null) {
			invalidPlayerNames.push(answer.player.name);
		}
	}

	// * Remove manually invalidated players (to avoid duplicates from old backlog)
	invalidPlayerNames.push(...invalidPlayers);

	// * Remove players from teams disabled in daily mode
	const disabledTeams = getDisabledTeams(dataset);
	const dedupedPlayers = seasonPlayers.players.filter(
		(player) => !invalidPlayerNames.includes(player.name) && !disabledTeams.includes(player.team as string)
	);

	// Apply Fisher-Yates shuffle
	for (let i = dedupedPlayers.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[dedupedPlayers[i], dedupedPlayers[j]] = [dedupedPlayers[j], dedupedPlayers[i]];
	}

	// Get slice with specified size
	const slicedPlayers: DbPlayer[] = dedupedPlayers.slice(0, size);
	return backlogCollection.updateOne({ _id: dataset }, { $set: { _id: dataset, players: slicedPlayers } }, { upsert: true });
}

/**
 * Checks if a player is contained in backlog of dataset (checks answers with checkFull=false, checks answers + backlog for checkFull=true)
 * @param player player to check
 * @param dataset dataset to check against
 * @param checkFull true: checks backlog + answers, false: only checks answers
 */
export async function isPlayerUnique(player: DbPlayer, dataset: Dataset, checkFull = false) {
	const backlogPlayers: DbPlayer[] = [];

	// Add answer players to backlog
	const answers = await answerCollection.find({ _id: { $regex: `.+_${dataset}` } }).toArray();
	for (const answer of answers) {
		backlogPlayers.push(answer.player);
	}

	// Add full backlog
	if (checkFull === true) {
		const backlog = await getBacklog(dataset);
		if (backlog) {
			for (const backlogPlayer of backlog.players) {
				backlogPlayers.push(backlogPlayer);
			}
		} else {
			throw new Error('Could not get backlog while checking if player is unique');
		}
	}

	return !backlogPlayers.includes(player);
}

/**
 * Insert one player to the start of the backlog (checks if player is globally unique)
 * @param player player to insert
 * @param dataset what dataset to insert backlog (defaults to season1)
 * @returns true, if new player is unqiue and was successfully inserted, false otherwise
 */
export async function insertOneBacklog(player: DbPlayer, dataset: Dataset) {
	// Check if player is unique, if not,
	const isUnique = await isPlayerUnique(player, dataset, true);
	if (!isUnique) return false;

	// Update backlog and save success info
	const res = await backlogCollection.updateOne({ _id: dataset }, { $push: { players: { $each: [player], $position: 0 } } }, { upsert: true });
	return res.acknowledged;
}

/**
 * Same as insertOneBacklog, except it doesn't check if the new player is unique
 */
export async function insertOneBacklogUnsafe(player: DbPlayer, dataset: Dataset) {
	return backlogCollection.updateOne({ _id: dataset }, { $push: { players: { $each: [player], $position: 0 } } }, { upsert: true });
}

/**
 * Insert many players to the start of the backlog (checks if players are globally unique)
 * @param player player to insert
 * @param dataset what dataset to insert backlog (defaults to season1)
 * @returns true, if new players are unqiue and were successfully inserted, false otherwise
 */
export async function insertManyBacklog(players: DbPlayer[], dataset: Dataset) {
	let isInputUnique = true;
	// Check if all input players are unique
	for (const player of players) {
		const isLocalUnique = await isPlayerUnique(player, dataset, true);
		if (!isLocalUnique) {
			isInputUnique = false;
		}
	}

	if (!isInputUnique) return false;
	// Update backlog and save success info
	const res = await backlogCollection.updateOne({ _id: dataset }, { $push: { players: { $each: players, $position: 0 } } }, { upsert: true });
	return res.acknowledged;
}

/**
 * Same as insertManyBacklog, except it doesn't check if the new player is unique
 */
export async function insertManyBacklogUnsafe(players: DbPlayer[], dataset: Dataset) {
	return backlogCollection.updateOne({ _id: dataset }, { $push: { players: { $each: players, $position: 0 } } }, { upsert: true });
}

/**
 * Pops backlog (removes and returns first element)
 * @param dataset what dataset to pop backlog for
 * @param session (optional), pass transaction session if used during transaction
 * @returns an object containing the popped item and the new length of the array
 */
export async function popBacklog(dataset: Dataset, session?: ClientSession) {
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
