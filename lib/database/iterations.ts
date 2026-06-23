import type { Dataset } from '@/data/datasets';
import { getRandomPlayer } from '@/data/players/formattedPlayers';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import type {
	DbIteration,
	DbPlayer,
} from '@/types/database';
import type { ClientSession } from 'mongodb';
import { iterationCollection } from './client';
import { getBacklog } from './backlog';

/**
 * Get the last N iterations for a dataset, sorted by iteration descending
 * @param dataset what dataset to get iterations for
 * @param n how many iterations to return
 */
export async function getLastNIterations(dataset: Dataset, n: number) {
	return iterationCollection.find({ dataset }, { sort: { iteration: -1 }, limit: n }).toArray();
}

/**
 * Pick random unique player that isn't in the exclusion list or the main backlog
 * @param dataset what dataset to get unique player for
 * @param exclusions list of players to exclude (e.g. recent iterations, current answer)
 */
export async function getUniqueRandomPlayer(dataset: Dataset, exclusions: DbPlayer[] = []) {
	let randomPlayer = getRandomPlayer(dataset);
	let isIncluded = true;

	const backlog = (await getBacklog(dataset))?.players;
	if (!backlog) return;

	while (isIncluded) {
		const isIncludedBacklog = backlog.some((player) => player.name === randomPlayer.name);
		const isExcluded = exclusions.some((player) => player.name === randomPlayer.name);
		if (!isIncludedBacklog && !isExcluded) {
			isIncluded = false;
		} else {
			randomPlayer = getRandomPlayer(dataset);
		}
	}

	return formattedToDbPlayer(randomPlayer);
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
