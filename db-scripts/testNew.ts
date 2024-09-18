import { getCurrentIteration, popBacklog } from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

console.time('test');

const popped = await popBacklog();
console.log('Popped item: ', popped);

console.timeEnd('test');
console.log('Finished.');
exit(0);
