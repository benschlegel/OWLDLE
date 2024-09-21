import { addFeedback, setNextAnswer } from '@/lib/databaseAccess';
import type { DbFeedback } from '@/types/database';
import { exit } from 'node:process';

console.time('feedback');
const feedback: DbFeedback = { feedback: 'cool!', timestamp: new Date() };
await addFeedback(feedback);
console.timeEnd('feedback');
console.log('Finished.');
exit(0);
