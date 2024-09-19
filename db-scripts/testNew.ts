import { PLAYERS } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import {
	getAllAnswers,
	getCurrentIteration,
	getUniqueRandomPlayer,
	goNextIteration,
	popBacklog,
	rerollAnswer,
	setPartialAnswer,
	updateIterationPlayer,
} from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

console.time('test');

// const popped = await popBacklog();
// console.log('Popped item: ', popped);
try {
	// const formattedPlayer = formattedToDbPlayer(PLAYERS[3]);
	// await setPartialAnswer('current', formattedPlayer);
	// await rerollAnswer('current');
	const player = await getUniqueRandomPlayer('OWL_season1');
	if (player) {
		await rerollAnswer('current');
	}
	// const answers = await getAllAnswers('OWL_season1');
	// console.log('Answers: ', answers);
	// await goNextIteration(GAME_CONFIG.nextResetHours, 'OWL_season1', GAME_CONFIG.backlogMaxSize);
} catch (e) {
	console.error('Failed to roll over iteration: ', e);
}

console.timeEnd('test');
console.log('Finished.');
exit(0);

// Expected: clockwork {curr: 2, linkzr}, {next: 3,chips }
// Expected: libero, dayfly, altering
