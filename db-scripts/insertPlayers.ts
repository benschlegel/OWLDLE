import { insertPlayers } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('insertPlayers');
await insertPlayers('owcs-s1');
console.timeEnd('insertPlayers');
exit(0);
