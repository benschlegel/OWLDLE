import { getCurrentIteration } from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

console.time('test');

const time = trimDate(new Date());
console.log('Trimmed: ', time.toTimeString());

console.timeEnd('test');
console.log('Finished.');
exit(0);
