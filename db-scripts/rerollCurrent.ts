import { rerollAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('reroll');
// await setCurrentAnswer({ player: player, iteration: 2, nextReset: new Date() });
await rerollAnswer('current', 'owcs-s2');
console.timeEnd('reroll');
console.log('Finished.');
exit(0);
