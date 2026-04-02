import { rerollAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('reroll');
// await setCurrentAnswer({ player: player, iteration: 2, nextReset: new Date() });
const result = await rerollAnswer('next', 'owcs-s3');
console.timeEnd('reroll');
console.log('New answer:', result);
exit(0);
