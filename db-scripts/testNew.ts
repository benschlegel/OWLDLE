import { GAME_CONFIG } from '@/lib/config';
import { getCurrentIteration, goNextIteration, popBacklog } from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

console.time('test');

// const popped = await popBacklog();
// console.log('Popped item: ', popped);
await goNextIteration(GAME_CONFIG.nextResetHours, 'OWL_season1', GAME_CONFIG.backlogMaxSize);

console.timeEnd('test');
console.log('Finished.');
exit(0);
