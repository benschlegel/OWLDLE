import { PLAYERS } from '@/data/players/formattedPlayers';
import { setNextAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

await setNextAnswer({ player: PLAYERS[0], iteration: 2, nextReset: new Date() });
console.log('Finished.');
exit(0);
