import { PLAYERS } from '@/data/players/formattedPlayers';
import { addIteration, dropAll, generateBacklog, insertAllPlayers, setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

// Make sure to only run this script if in dev mode, don't want to reset prod db
const nextReset = trimDate(new Date(Date.UTC(2024, 8, 20, 2, 0, 0)));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);
// const nextReset = getFormattedMidnightTmrw();
// const nextNextReset = getFormattedMidnightDayAfter();
const env = process.env.NODE_ENV;
// if (env !== 'production') {
console.time('regen');

// Delete old data
await dropAll();

// Set players
await insertAllPlayers();

// Insert answers
const randomPlayer = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
const randomPlayer2 = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
const curr = { player: randomPlayer, iteration: 1, nextReset: nextReset };
await setCurrentAnswer(curr);
await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: nextNextReset });

// Set first iteration
const dayBefore = new Date(nextReset);
dayBefore.setDate(dayBefore.getDate() - 1);
await addIteration({ iteration: curr.iteration, dataset: 'OWL_season1', player: curr.player, resetAt: dayBefore });

// Regen backlog
await generateBacklog();

console.timeEnd('regen');
console.log('Finished.');
exit(0);
// }

console.info("Make sure to run this script with NODE_ENV!='production'");
exit(-1);

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

// Before: curr: {id: 1, reset: 19., player: Clockwork}
// Before: next: {id: 2, reset: 20., player: Linkzr}
// Before: backlog: {length: 20, [...chips, dayfly]}
