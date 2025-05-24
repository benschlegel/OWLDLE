import { generateBacklog } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('backlog');
await generateBacklog(40, 'owcs-s2');
console.timeEnd('backlog');
console.log('Finished.');
exit(0);
