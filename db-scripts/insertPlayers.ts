import { insertAllPlayers } from '@/lib/databaseAccess';
import { exit } from 'node:process';

await insertAllPlayers().then(() => console.log('finished.'));
exit(0);
