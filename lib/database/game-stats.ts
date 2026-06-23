import type { Dataset } from '@/data/datasets';
import type { DbGameResult } from '@/types/database';
import { gameStatsCollection } from './client';

/**
 * Atomically increment game stats for a given dataset + iteration.
 * Creates the document on first call (upsert). Returns the updated document.
 * @param dataset which dataset
 * @param iteration which iteration
 * @param gameResult 'won' or 'lost'
 * @param guessCount number of guesses used (only meaningful for wins)
 */
export async function updateGameStats(dataset: Dataset, iteration: number, gameResult: DbGameResult, guessCount: number) {
	const statsId = `stats_${dataset}_${iteration}`;
	const distributionKey = gameResult === 'won' ? `guessDistribution.${guessCount}` : 'guessDistribution.failed';

	return gameStatsCollection.findOneAndUpdate(
		{ _id: statsId },
		{
			$inc: {
				totalGames: 1,
				wins: gameResult === 'won' ? 1 : 0,
				losses: gameResult === 'lost' ? 1 : 0,
				[distributionKey]: 1,
			},
			$setOnInsert: {
				dataset,
				iteration,
			},
		},
		{ upsert: true, returnDocument: 'after' }
	);
}

/**
 * Get game stats for a given dataset + iteration
 */
export async function getGameStats(dataset: Dataset, iteration: number) {
	const statsId = `stats_${dataset}_${iteration}`;
	return gameStatsCollection.findOne({ _id: statsId });
}
