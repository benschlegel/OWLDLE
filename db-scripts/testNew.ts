import type { Dataset } from '@/data/datasets';
import { getAllAnswers, getBacklog, setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('test');

// const popped = await popBacklog();
// console.log('Popped item: ', popped);
try {
	const answers = getAllAnswers('season1');
	console.log('Answers: ', answers);
	// await goNextIteration(GAME_CONFIG.nextResetHours, 'OWL_season1', GAME_CONFIG.backlogMaxSize);
} catch (e) {
	console.error('Failed to roll over iteration: ', e);
}

console.timeEnd('test');
console.log('Finished.');
exit(0);

// Expected: clockwork {curr: 2, linkzr}, {next: 3,chips }
// Expected: libero, dayfly, altering
