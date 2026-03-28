import { GAME_CONFIG } from '@/lib/config';
import { generateBacklog } from '@/lib/databaseAccess';
import { exit } from 'node:process';

// use to avoid duplicates from old backlog
const blacklist: string[] = [];

console.time('backlog');
await generateBacklog(GAME_CONFIG.backlogMaxSize, 'owcs-s2', undefined, blacklist);
console.timeEnd('backlog');
console.log('Finished.');
exit(0);
