import { generateBacklog } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('backlog');
await generateBacklog(10);
console.timeEnd('backlog');
console.log('Finished.');
exit(0);
