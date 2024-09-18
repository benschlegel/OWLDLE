import { PLAYERS } from '@/data/players/formattedPlayers';
import { addIteration, getCurrentAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('answer');
const answer = await getCurrentAnswer();
console.timeEnd('answer');
console.log('Finished: ', answer);
exit(0);
