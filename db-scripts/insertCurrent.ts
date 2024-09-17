import { PLAYERS } from '@/data/players/formattedPlayers';
import { setCurrentAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

await setCurrentAnswer({ player: PLAYERS[5], iteration: 1, nextReset: new Date() });
console.log('Finished.');
exit(0);
