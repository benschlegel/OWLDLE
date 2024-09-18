import { PLAYERS } from '@/data/players/formattedPlayers';
import { addIteration } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('iteration');
const player = PLAYERS[3];
await addIteration({ iteration: 1, dataset: 'OWL_season1', player: player, resetAt: new Date() });
console.timeEnd('iteration');
console.log('Finished.');
exit(0);
