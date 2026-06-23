import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { trimAndAddHours, trimDate } from '@/lib/utils';
import type { DbAnswer } from '@/types/database';
import { getCurrentAnswer, getNextAnswer, setCurrentAnswer, setNextAnswer } from './answers';
import { generateBacklog, popBacklog } from './backlog';
import { addIteration } from './iterations';

/**
 * Wrapper that handles going to the next iteration (if resetDate was reached)
 * Works as a transaction, either everything gets rolled over to next iteration or everything fails
 * @param nextResetHours hours until next reset
 */
export async function goNextIteration(
	nextResetHours: number = GAME_CONFIG.nextResetHours,
	dataset: Dataset = 'season1',
	backlogSize: number = GAME_CONFIG.backlogMaxSize
) {
	// * Prep: get current answer from db, error out if not working
	const currentAnswer = await getCurrentAnswer(dataset);
	const nextAnswer = await getNextAnswer(dataset);
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
