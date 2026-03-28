import { DATASETS } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import {
	addIteration,
	dbName,
	dropAll,
	generateBacklog,
	getAnswer,
	getUniqueRandomPlayer,
	insertAllPlayers,
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
if (dbName !== 'OWLEL-dev') {
	console.error(`Refusing to run against production database (${dbName}). Use .env.local for dev.`);
	exit(1);
}

// ! Configure your first reset date here (in UTC)
// ! Keep in mind that javascript months start at 0
// ! By default, sets to midnight UTC (when timezone is Europe/Vienna)
const now = new Date();
const nextReset = trimDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0)));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);

console.time('regen');
// * Delete old data
await dropAll();

// * Insert all players
await insertAllPlayers();

for (const dataset of DATASETS) {
	// * Regen backlog
	await generateBacklog(GAME_CONFIG.backlogMaxSize, dataset);

	// * Insert answers (players get re-rolled later to ensure unique)
	const randomPlayer = await getUniqueRandomPlayer(dataset);
	const randomPlayer2 = await getUniqueRandomPlayer(dataset);
	if (!randomPlayer || !randomPlayer2) {
		console.error(`Did not find random player for dataset ${dataset}.`);
		exit(1);
	}
	const curr = { player: randomPlayer, iteration: 1, nextReset: nextReset };
	await setCurrentAnswer(curr, dataset);
	await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: nextNextReset }, dataset);

	// * Reroll answers to ensure unique
	await rerollAnswer('current', dataset);
	await rerollAnswer('next', dataset);

	// * Set first iteration (get curr_answer data from db)
	const currAnswer = await getAnswer('current', dataset);
	if (!currAnswer) throw new Error('Could not get current answer');
	await addIteration({ iteration: currAnswer.iteration, dataset: dataset, player: currAnswer.player, resetAt: nextReset });
}

// * Regenerating/Initializing database done.
console.timeEnd('regen');
console.log('Finished.');
exit(0);
