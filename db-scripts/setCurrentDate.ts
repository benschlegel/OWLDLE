import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { setCurrentAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

const offsetMinutes = 5;

console.time('setCurrent');
const player = formattedToDbPlayer(PLAYERS_S1[5]);
const offsetDate = new Date();
offsetDate.setMinutes(offsetDate.getMinutes() + offsetMinutes);
offsetDate.setSeconds(0);
offsetDate.setMilliseconds(0);
// await setCurrentAnswer({ player: player, iteration: 2, nextReset: new Date() });
const abc = await setCurrentAnswer({ iteration: 8, nextReset: offsetDate, player: player }, 'OWL_season1');
console.log('Abc: ', abc);
console.timeEnd('setCurrent');
console.log('Finished.');
exit(0);
