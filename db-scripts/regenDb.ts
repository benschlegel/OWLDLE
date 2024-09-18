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
	const currPlayer = formattedToDbPlayer(PLAYERS[0]);
	await setCurrentAnswer({ player: currPlayer, iteration: 1, nextReset: new Date() });
	const nextPlayer = formattedToDbPlayer(PLAYERS[3]);
	await setNextAnswer({ player: nextPlayer, iteration: 2, nextReset: new Date() });

	// Set first iteration
	const player = PLAYERS[3];
	await addIteration({ iteration: 0, dataset: 'OWL_season1', player: player, resetAt: new Date() });

	// Regen backlog
	await generateBacklog();

	console.timeEnd('regen');
	console.log('Finished.');
	exit(0);
}

console.info("Make sure to run this script with NODE_ENV!='production'");
exit(-1);
