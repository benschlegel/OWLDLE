import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import type {
	AnswerKey,
	DbAnswer,
	DbAnswerPrefix,
	DbPlayer,
} from '@/types/database';
import type { ClientSession } from 'mongodb';
import { answerCollection } from './client';
import { getLastNIterations, getUniqueRandomPlayer, updateIterationPlayer } from './iterations';

/**
 * Sets the current game answer
 * IMPORTANT: make sure the player does not contain countryImg field
 * @param answer the answer that's currently correct
 * @param dataset what dataset to write answer for
 * @param session (optional), pass transaction session if used during transaction
 */
export async function setCurrentAnswer(answer: DbAnswer, dataset: Dataset, session?: ClientSession) {
	const answerKey: AnswerKey = `current_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { ...answer, _id: answerKey } }, { upsert: true, session });
}

/**
 * Get current answer from db
 * @param dataset which dataset to get current answer for
 */
export async function getCurrentAnswer(dataset: Dataset) {
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
export async function setNextAnswer(answer: DbAnswer, dataset: Dataset, session?: ClientSession) {
	const answerKey: AnswerKey = `next_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { ...answer, _id: answerKey } }, { upsert: true, session });
}

/**
 * Get the answer for a given dataset
 * @param answerPrefix the type of answer to get (e.g. "current" or "next")
 * @param dataset which dataset to get answer for
 */
export async function getAnswer(answerPrefix: DbAnswerPrefix, dataset: Dataset) {
	const answerKey: AnswerKey = `${answerPrefix}_${dataset}`;
	return answerCollection.findOne({ _id: answerKey });
}

/**
 * Get all answers (e.g. [{_id: "current_dataset"}, {_id: "next_dataset"}]) for given dataset
 */
export async function getAllAnswers(dataset: Dataset) {
	return answerCollection.find({ _id: { $regex: `.+_${dataset}` } }).toArray();
}

/**
 * Get current answer from db
 * @param dataset which dataset to get current answer for
 */
export async function getNextAnswer(dataset: Dataset) {
	const answerKey: AnswerKey = `next_${dataset}`;
	return answerCollection.findOne({ _id: answerKey });
}

/**
 * Updates an answer with new player
 * @param answerPrefix "current" or "next"
 * @param player new player to set for answer
 * @param dataset what dataset to set player for
 */
export async function setPartialAnswer(answerPrefix: DbAnswerPrefix, player: DbPlayer, dataset: Dataset) {
	const answerKey: AnswerKey = `${answerPrefix}_${dataset}`;
	return answerCollection.updateOne({ _id: answerKey }, { $set: { player: player } });
}

/**
 * Get current iteration for dataset
 * @param dataset which dataset to get current iteration for
 */
export async function getCurrentIteration(dataset: Dataset) {
	const answerKey: AnswerKey = `current_${dataset}`;
	const iterationRes = await answerCollection.findOne({ _id: answerKey }, { projection: { iteration: 1, _id: 0 } });
	return iterationRes?.iteration;
}

/**
 * Updates an answer with new player
 * @param answerPrefix "current" or "next"
 * @param player new player to set for answer
 * @param dataset what dataset to set player for
 * @returns true, if update was rerolled and inserted successfully, false, if not
 */
export async function rerollAnswer(answerPrefix: DbAnswerPrefix, dataset: Dataset) {
	const answerKey: AnswerKey = `${answerPrefix}_${dataset}`;

	// Build exclusion list: last 20 iterations + current answer (if rolling next)
	const recentIterations = await getLastNIterations(dataset, GAME_CONFIG.backlogMaxSize);
	const exclusions: DbPlayer[] = recentIterations.map((it) => it.player);

	if (answerPrefix === 'next') {
		const current = await getAnswer('current', dataset);
		if (current) exclusions.push(current.player);
	}

	const randomPlayer = await getUniqueRandomPlayer(dataset, exclusions);
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
		const updated = await updateIterationPlayer(iteration, randomPlayer);
		if (!updated) return false;
	}

	return randomPlayer;
}
