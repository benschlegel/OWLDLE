import { addFeedback, setNextAnswer } from '@/lib/databaseAccess';
import type { DbFeedback } from '@/types/database';
import { exit } from 'node:process';

console.time('feedback');
const feedback: DbFeedback = { feedbackContent: 'cool!' };
await addFeedback(feedback);
console.timeEnd('feedback');
console.log('Finished.');
exit(0);
