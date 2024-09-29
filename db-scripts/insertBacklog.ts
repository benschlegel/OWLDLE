import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { insertManyBacklog } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('insertBacklog');

// What players to insert
const players = [PLAYERS_S1[1], PLAYERS_S1[2], PLAYERS_S1[3]];

// Format players + insert
const mappedPlayers = players.map((player) => formattedToDbPlayer(player));
await insertManyBacklog(mappedPlayers, 'OWL_season1');

console.timeEnd('insertBacklog');
console.log('Finished.');
exit(0);
