import { GAME_CONFIG } from '@/lib/config';
import { getCurrentIteration, goNextIteration, popBacklog } from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

console.time('test');

// const popped = await popBacklog();
// console.log('Popped item: ', popped);
try {
	await goNextIteration(GAME_CONFIG.nextResetHours, 'OWL_season1', GAME_CONFIG.backlogMaxSize);
} catch (e) {
	console.error('Failed to roll over iteration: ', e);
}

console.timeEnd('test');
console.log('Finished.');
exit(0);

// Expected: clockwork {curr: 2, linkzr}, {next: 3,chips }
// Expected: libero, dayfly, altering
