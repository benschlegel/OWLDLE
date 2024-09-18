import { PLAYERS } from '@/data/players/formattedPlayers';
import { getCurrentAnswer, setCurrentAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('setCurrent');
const player = formattedToDbPlayer(PLAYERS[5]);
// await setCurrentAnswer({ player: player, iteration: 2, nextReset: new Date() });
const abc = await getCurrentAnswer();
console.log('Abc: ', abc);
console.timeEnd('setCurrent');
console.log('Finished.');
exit(0);
