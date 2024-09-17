import { deleteAllPlayers, insertAllPlayers } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.log('IsProd: ', process.env.MY_VAR);
await insertAllPlayers().then(() => console.log('finished.'));
exit(0);
