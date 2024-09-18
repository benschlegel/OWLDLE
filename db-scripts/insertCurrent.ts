import { PLAYERS } from '@/data/players/formattedPlayers';
import { setCurrentAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('setCurrent');
const player = formattedToDbPlayer(PLAYERS[5]);
await setCurrentAnswer({ player: player, iteration: 1, nextReset: new Date() });
console.timeEnd('setCurrent');
console.log('Finished.');
exit(0);
