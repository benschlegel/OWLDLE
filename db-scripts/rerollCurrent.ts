import { PLAYERS } from '@/data/players/formattedPlayers';
import { getCurrentAnswer, rerollAnswer, setCurrentAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('reroll');
// await setCurrentAnswer({ player: player, iteration: 2, nextReset: new Date() });
await rerollAnswer('current', 'OWL_season1');
console.timeEnd('reroll');
console.log('Finished.');
exit(0);
