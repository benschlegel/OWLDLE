import type { Dataset } from '@/data/datasets';
import { getAnswer, getUniqueRandomPlayer, setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

// ! Configure the dataset to refresh answers for
const DATASET: Dataset = 'owcs-s2';

const now = new Date();
const nextReset = trimDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0)));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);

console.log(`Refreshing answers for dataset: ${DATASET}`);
console.time('refresh');

// * Get existing iteration numbers (default to 1 if no answers exist)
const existingCurrent = await getAnswer('current', DATASET);
const existingNext = await getAnswer('next', DATASET);
const currentIteration = existingCurrent?.iteration ?? 1;
const nextIteration = existingNext?.iteration ?? 1;

// * Pick new random players
const randomPlayer = await getUniqueRandomPlayer(DATASET);
const randomPlayer2 = await getUniqueRandomPlayer(DATASET);
if (!randomPlayer || !randomPlayer2) {
	console.error(`Did not find random player for dataset ${DATASET}.`);
	exit(1);
}

// * Set answers with new timestamps, keeping existing iterations
await setCurrentAnswer({ player: randomPlayer, iteration: currentIteration, nextReset: nextReset }, DATASET);
await setNextAnswer({ player: randomPlayer2, iteration: nextIteration, nextReset: nextNextReset }, DATASET);

console.timeEnd('refresh');
console.log('Finished.');
exit(0);
