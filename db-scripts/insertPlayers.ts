import { insertAllPlayers } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('insertPlayers');
await insertAllPlayers('season1');
console.timeEnd('insertPlayers');
exit(0);
