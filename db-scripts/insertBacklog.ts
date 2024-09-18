import { PLAYERS } from '@/data/players/formattedPlayers';
import { insertManyBacklog, insertOneBacklog, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('insertBacklog');

// What players to insert
const players = [PLAYERS[1], PLAYERS[2], PLAYERS[3]];

// Format players + insert
const mappedPlayers = players.map((player) => formattedToDbPlayer(player));
await insertManyBacklog(mappedPlayers);

console.timeEnd('insertBacklog');
console.log('Finished.');
exit(0);
