import { PLAYERS } from '@/data/players/formattedPlayers';
import { addIteration, getCurrentAnswer, getCurrentIteration } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('answer');
const answer = await getCurrentIteration();
console.timeEnd('answer');
console.log('Finished: ', answer);
exit(0);
