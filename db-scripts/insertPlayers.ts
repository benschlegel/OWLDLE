import { insertPlayers } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('insertPlayers');
await insertPlayers('season1');
console.timeEnd('insertPlayers');
exit(0);
