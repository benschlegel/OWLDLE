import type { Dataset } from '@/data/datasets';
import type { DbGameResult, DbGuess } from '@/types/database';
import { gameLogCollection } from './client';
import { getCurrentIteration } from './answers';

/**
 * Log game state to db
 * @param dataset
 */
export async function logGame(gameData: DbGuess[], gameResult: DbGameResult, timestamp: Date, dataset: Dataset) {
	if (gameData.length > 0) {
		// Get current iteration
		const currIteration = await getCurrentIteration(dataset);
		if (currIteration && currIteration > 0) {
			return gameLogCollection.insertOne({ iteration: currIteration, finishedAt: timestamp, dataset: dataset, gameData: gameData, gameResult: gameResult });
		}
		throw new Error('Could not get current iteration from db.');
	}
}
