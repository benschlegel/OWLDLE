import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import {
	addIteration,
	dbName,
	dropDataset,
	generateBacklog,
	getAnswer,
	getUniqueRandomPlayer,
	insertPlayers,
	rerollAnswer,
	setCurrentAnswer,
	setNextAnswer,
} from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

// ! SAFETY: Set to true to allow this script to run. Reset to false after use.
const I_KNOW_WHAT_I_AM_DOING = false;
if (!I_KNOW_WHAT_I_AM_DOING) {
	console.error('Safety guard is enabled. Set I_KNOW_WHAT_I_AM_DOING to true to run this script.');
	exit(1);
}
// ! Configure the dataset to generate data for
const DATASET: Dataset = 'owcs-s3';

// ! Configure your first reset date here (in UTC)
// ! Keep in mind that javascript months start at 0
// ! By default, sets to midnight UTC (when timezone is Europe/Vienna)
const now = new Date();
const nextReset = trimDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0)));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);

console.log('Node env: ', process.env.NODE_ENV);

console.log(`Generating data for dataset: ${DATASET}`);
console.time('generate');

// * Drop existing data for this dataset
await dropDataset(DATASET);

// * Insert players for this dataset
await insertPlayers(DATASET);

// * Regen backlog
await generateBacklog(GAME_CONFIG.backlogMaxSize, DATASET);

// * Insert answers (players get re-rolled later to ensure unique)
const randomPlayer = await getUniqueRandomPlayer(DATASET);
const randomPlayer2 = await getUniqueRandomPlayer(DATASET);
if (!randomPlayer || !randomPlayer2) {
	console.error(`Did not find random player for dataset ${DATASET}.`);
	exit(1);
}
await setCurrentAnswer({ player: randomPlayer, iteration: 1, nextReset: nextReset }, DATASET);
await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: nextNextReset }, DATASET);

// * Reroll answers to ensure unique
await rerollAnswer('current', DATASET);
await rerollAnswer('next', DATASET);

// * Set first iteration (get curr_answer data from db)
const currAnswer = await getAnswer('current', DATASET);
if (!currAnswer) throw new Error('Could not get current answer');
await addIteration({ iteration: currAnswer.iteration, dataset: DATASET, player: currAnswer.player, resetAt: nextReset });

console.timeEnd('generate');
console.log('Finished.');
exit(0);
