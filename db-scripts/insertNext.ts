import { PLAYERS } from '@/data/players/formattedPlayers';
import { setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('setNext');
const player = formattedToDbPlayer(PLAYERS[3]);
await setNextAnswer({ player: player, iteration: 2, nextReset: new Date() });
console.timeEnd('setNext');
console.log('Finished.');
exit(0);
