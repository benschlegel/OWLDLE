import { DATASETS } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { goNextIteration } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('test');

// const popped = await popBacklog();
// console.log('Popped item: ', popped);
try {
	for (const dataset of DATASETS) {
		await goNextIteration(GAME_CONFIG.nextResetHours, dataset, GAME_CONFIG.backlogMaxSize);
	}
} catch (e) {
	console.error('Failed to roll over iteration: ', e);
}

console.timeEnd('test');
console.log('Finished.');
exit(0);

// Expected: clockwork {curr: 2, linkzr}, {next: 3,chips }
// Expected: libero, dayfly, altering
