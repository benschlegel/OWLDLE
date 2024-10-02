import { DATASETS, type Dataset } from '@/data/datasets';
import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import {
	addIteration,
	dropAll,
	generateBacklog,
	getAnswer,
	insertAllPlayers,
	insertPlayers,
	rerollAnswer,
	setCurrentAnswer,
	setNextAnswer,
} from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

// ! Configure your first reset date here (in UTC)
// ! Keep in mind that javascript months start at 0
// ! By default, sets to midnight UTC (when timezone is Europe/Vienna)
const now = new Date();
const nextReset = trimDate(new Date(Date.UTC(2024, now.getMonth(), now.getDate(), 22, 0, 0)));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);
// const nextReset = getFormattedMidnightTmrw();
// const nextNextReset = getFormattedMidnightDayAfter();

console.time('regen');
// * Delete old data
await dropAll();

// * Insert all players
await insertAllPlayers();

for (const dataset of DATASETS) {
	// * Regen backlog
	await generateBacklog(GAME_CONFIG.backlogMaxSize, dataset);

	// * Insert answers (players get re-rolled later to ensure unique)
	const randomPlayer = formattedToDbPlayer(PLAYERS_S1[Math.floor(Math.random() * PLAYERS_S1.length)]);
	const randomPlayer2 = formattedToDbPlayer(PLAYERS_S1[Math.floor(Math.random() * PLAYERS_S1.length)]);
	const curr = { player: randomPlayer, iteration: 1, nextReset: nextReset };
	await setCurrentAnswer(curr, dataset);
	await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: nextNextReset }, dataset);

	// * Reroll answers to ensure unique
	await rerollAnswer('current', dataset);
	await rerollAnswer('next', dataset);

	// * Set first iteration (get curr_answer data from db)
	const dayBefore = new Date(nextReset);
	dayBefore.setDate(dayBefore.getDate() - 1);
	const currAnswer = await getAnswer('current', dataset);
	if (!currAnswer) throw new Error('Could not get current answer');
	await addIteration({ iteration: currAnswer.iteration, dataset: dataset, player: currAnswer.player, resetAt: nextReset });
}

// * Regenerating/Initializing database done.
console.timeEnd('regen');
console.log('Finished.');
exit(0);

// Date helpers if inserting automatically
function getFormattedMidnight(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setDate(midnight.getDate() - 1);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}

function getFormattedMidnightTmrw(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}

function getFormattedMidnightDayAfter(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setDate(midnight.getDate() + 1);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}
