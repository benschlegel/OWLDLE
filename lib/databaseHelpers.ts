import type { CombinedFormattedPlayer, FormattedPlayer } from '@/data/players/formattedPlayers';
import type { DbPlayer } from '@/types/database';

export function formattedToDbPlayer(player: CombinedFormattedPlayer): DbPlayer {
	const deleted = deleteProperty(player, 'countryImg');
	return deleteProperty(deleted, 'regionImg');
}
function deleteProperty<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
	// Destructuring to remove the key
	const { [key]: _, ...newObj } = obj;
	return newObj as Omit<T, K>;
}

// * goNextIteration function that supports transactions (fixed)
/**
 * Wrapper that handles going to the next iteration (if resetDate was reached)
 * Works as a transaction, either everything gets rolled over to next iteration or everything fails
 * @param nextResetHours hours until next reset
 */
// export async function goNextIteration(
// 	nextResetHours: number = GAME_CONFIG.nextResetHours,
// 	dataset: DbDatasetID = 'OWL_season1',
// 	backlogSize: number = GAME_CONFIG.backlogMaxSize
// ) {
// 	// * Prep: get current answer from db, error out if not working
// 	const currentAnswer = await getCurrentAnswer();
// 	const nextAnswer = await getNextAnswer();
// 	if (!currentAnswer || !nextAnswer) {
// 		throw new Error('Could not get current answers from database.');
// 	}

// 	// Prepare data
// 	const nextIterationId = currentAnswer.iteration + 1;
// 	const now = trimDate(new Date());
// 	const nextResetDate = trimAndAddHours(now, nextResetHours);
// 	const nextAnswerData: DbAnswer = { iteration: nextIterationId, nextReset: nextResetDate, player: nextAnswer.player };

// 	// Prepare transaction
// 	const session = dbClient.startSession();
// 	const transactionOptions = {
// 		readPreference: 'primary',
// 		readConcern: { level: 'local' },
// 		writeConcern: { w: 'majority' },
// 	};

// 	try {
// 		await session.withTransaction(async () => {
// 			// * Set next answer to current answer
// 			await setCurrentAnswer(nextAnswerData, dataset, session);

// 			// * Log new iteration to db
// 			await addIteration({ dataset: dataset, iteration: nextIterationId, player: nextAnswerData.player, resetAt: now }, session);

// 			// * Get next player from backlog
// 			const poppedData = await popBacklog(dataset, session);
// 			if (!poppedData || poppedData.poppedPlayer === undefined) {
// 				throw new Error('Could not get player from backlog');
// 			}

// 			const newPlayer = poppedData.poppedPlayer;
// 			const newLength = poppedData.newLength;

// 			// * Generate and set new nextAnswer
// 			const nextAnswerIteration = nextIterationId + 1;
// 			const nextAnswerReset = trimAndAddHours(nextResetDate, nextResetHours);
// 			const answerRes = await setNextAnswer({ iteration: nextAnswerIteration, nextReset: nextAnswerReset, player: newPlayer }, dataset, session);
// 			if (!answerRes.acknowledged) {
// 				throw new Error('Failed to set new answer');
// 			}

// 			// * If new backlog is empty, regenerate it
// 			if (newLength === 0) {
// 				const backlogRes = await generateBacklog(backlogSize, dataset, session);
// 				if (!backlogRes.acknowledged) {
// 					throw new Error('Failed to regenerate backlog');
// 				}
// 			}
// 		}, {});
// 	} catch (error) {
// 		console.error('Transaction failed:', error);
// 		throw error; // Re-throw the error to be handled by the caller
// 	} finally {
// 		await session.endSession();
// 	}

// 	// step 1: get current answer
// 	// step 2: increment iteration
// 	// step 3: set new current to old next
// 	// step 4: log new current
// 	// step 5: pop from backlog
// 	// step 5.5: regenerate backlog, if necessary
// 	// step 6: set new next
// }

// * Original transaction function
// export async function goNextIteration(
// 	nextResetHours: number = GAME_CONFIG.nextResetHours,
// 	dataset: DbDatasetID = 'OWL_season1',
// 	backlogSize: number = GAME_CONFIG.backlogMaxSize
// ) {
// 	// * Prep: get current answer from db, error out if not working
// 	const currentAnswer = await getCurrentAnswer();
// 	const nextAnswer = await getNextAnswer();
// 	if (!currentAnswer || !nextAnswer) {
// 		return Promise.reject(new Error('Could not get current answers from database.'));
// 	}

// 	// Prepare data
// 	const nextIterationId = currentAnswer.iteration + 1;
// 	const now = trimDate(new Date());
// 	const nextResetDate = trimAndAddHours(now, nextResetHours);
// 	const nextAnswerData: DbAnswer = { iteration: nextIterationId, nextReset: nextResetDate, player: nextAnswer.player };

// 	// Prepare transaction
// 	const session = dbClient.startSession();
// 	const transactionOptions = {
// 		readPreference: 'primary',
// 		readConcern: { level: 'local' },
// 		writeConcern: { w: 'majority' },
// 	};

// 	// * Start Transaction
// 	try {
// 		await session.withTransaction(
// 			async () => {
// 				// * Set next answer to current answer
// 				// * Also resets iteration id + resetDate
// 				try {
// 					await setCurrentAnswer(nextAnswerData, dataset, session);
// 				} catch (e) {
// 					session.abortTransaction();
// 					return Promise.reject(new Error('error while setting next iteration: could not set new current answer'));
// 				}

// 				// * Log new iteration to db
// 				// * Also add resetAt to now
// 				try {
// 					await addIteration({ dataset: dataset, iteration: nextIterationId, player: nextAnswerData.player, resetAt: now }, session);
// 				} catch (e) {
// 					session.abortTransaction();
// 					return Promise.reject(new Error('error while setting next iteration: could not set new current answer'));
// 				}

// 				// * Get next player from backlog
// 				let newPlayer: DbPlayer;
// 				let newLength = 0;
// 				try {
// 					const poppedData = await popBacklog(dataset, session);
// 					if (poppedData && poppedData.poppedPlayer !== undefined) {
// 						session.abortTransaction();
// 						return Promise.reject(new Error('error while setting next iteration: could not get player from backlog'));
// 					}

// 					newPlayer = poppedData.poppedPlayer;
// 					newLength = poppedData.newLength;
// 				} catch (e) {
// 					session.abortTransaction();
// 					return Promise.reject(new Error('error while setting next iteration: could not get player from backlog'));
// 				}

// 				// * Generate and set new nextAnswer
// 				try {
// 					const nextAnswerIteration = nextIterationId + 1;
// 					const nextAnswerReset = trimAndAddHours(nextResetDate, nextResetHours);
// 					const answerRes = await setNextAnswer({ iteration: nextAnswerIteration, nextReset: nextAnswerReset, player: newPlayer }, dataset, session);
// 					if (!answerRes.acknowledged) {
// 						session.abortTransaction();
// 						return Promise.reject(new Error('error while setting next iteration: failed to set new answer'));
// 					}
// 				} catch (e) {
// 					session.abortTransaction();
// 					return Promise.reject(new Error('error while setting next iteration: failed to set new answer'));
// 				}

// 				// * If new backlog is empty, regenerate it
// 				if (newLength === 0) {
// 					try {
// 						const backlogRes = await generateBacklog(backlogSize, dataset, session);
// 						if (!backlogRes.acknowledged) {
// 							session.abortTransaction();
// 							return Promise.reject(new Error('error while setting next iteration: failed to regenerate backlog'));
// 						}
// 					} catch (e) {
// 						session.abortTransaction();
// 						return Promise.reject(new Error('error while setting next iteration: failed to regenerate backlog'));
// 					}
// 				}
// 			},
// 			{ readPreference: 'primary' }
// 		);
// 	} finally {
// 		await session.endSession();
// 	}
// 	// step 1: get current answer
// 	// step 2: increment iteration
// 	// step 3: set new current to old next
// 	// step 4: log new current
// 	// step 5: pop from backlog
// 	// step 5.5: regenerate backlog, if necessary
// 	// step 6: set new next
// }

// // TODO: also handle get client
// // TODO: call get client on startup to fetch
