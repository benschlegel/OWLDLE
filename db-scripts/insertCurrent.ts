import { PLAYERS } from '@/data/players/formattedPlayers';
import { setPartialAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('setCurrent');
const newPlayerName = 'super';
const foundPlayer = PLAYERS.find((p) => p.name === newPlayerName);
if (!foundPlayer) exit(-1);
const player = formattedToDbPlayer(foundPlayer);
// await setCurrentAnswer({ player: player, iteration: 2, nextReset: new Date() });
await setPartialAnswer('current', player, 'OWL_season1');
console.timeEnd('setCurrent');
console.log('Finished.');
exit(0);
