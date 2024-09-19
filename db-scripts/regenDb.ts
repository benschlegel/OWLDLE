import { PLAYERS } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { addIteration, dropAll, generateBacklog, getAnswer, insertAllPlayers, rerollAnswer, setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { trimDate } from '@/lib/utils';
import type { DbDatasetID } from '@/types/database';
import { exit } from 'node:process';

const DATASET: DbDatasetID = 'OWL_season1';
// ! Configure your first reset date here (in UTC)
// ! Keep in mind that javascript months start at 0
const nextReset = trimDate(new Date(Date.UTC(2024, 8, 19, 22, 0, 0)));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);
// const nextReset = getFormattedMidnightTmrw();
// const nextNextReset = getFormattedMidnightDayAfter();

console.time('regen');
// * Delete old data
await dropAll();

// * Set players
await insertAllPlayers(DATASET);

// * Regen backlog
await generateBacklog(GAME_CONFIG.backlogMaxSize, DATASET);

// * Insert answers (players get re-rolled later to ensure unique)
const randomPlayer = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
const randomPlayer2 = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
const curr = { player: randomPlayer, iteration: 1, nextReset: nextReset };
await setCurrentAnswer(curr, DATASET);
await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: nextNextReset }, DATASET);

// * Reroll answers to ensure unique
await rerollAnswer('current');
await rerollAnswer('next');

// * Set first iteration (get curr_answer data from db)
const dayBefore = new Date(nextReset);
dayBefore.setDate(dayBefore.getDate() - 1);
const currAnswer = await getAnswer('current');
if (!currAnswer) throw new Error('Could not get current answer');
await addIteration({ iteration: currAnswer.iteration, dataset: DATASET, player: currAnswer.player, resetAt: dayBefore });

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
