import { PLAYERS } from '@/data/players/formattedPlayers';
import { addIteration, dropAll, generateBacklog, insertAllPlayers, setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

// Make sure to only run this script if in dev mode, don't want to reset prod db
const env = process.env.NODE_ENV;
if (env !== 'production') {
	console.time('regen');

	// Delete old data
	await dropAll();

	// Set players
	await insertAllPlayers();

	// Insert answers
	const randomPlayer = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
	const randomPlayer2 = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
	const curr = { player: randomPlayer, iteration: 1, nextReset: getFormattedMidnightTmrw() };
	await setCurrentAnswer(curr);
	await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: getFormattedMidnightDayAfter() });

	// Set first iteration
	await addIteration({ iteration: curr.iteration, dataset: 'OWL_season1', player: curr.player, resetAt: getFormattedMidnight() });

	// Regen backlog
	await generateBacklog();

	console.timeEnd('regen');
	console.log('Finished.');
	exit(0);
}

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

// Before: curr: {id: 1, reset: 19., player: ArK}
// Before: next: {id: 2, reset: 20., player: SoOn}
