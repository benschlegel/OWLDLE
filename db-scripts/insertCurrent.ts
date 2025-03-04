import { type Dataset, getDataset } from '@/data/datasets';
import { setPartialAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import type { DbAnswerPrefix } from '@/types/database';
import { exit } from 'node:process';

// * config
const season: Dataset = 'owcs-s2';
const newPlayerName = 'PEPPI';
const answer: DbAnswerPrefix = 'current';

console.time('setCurrent');
const dataset = getDataset(season);
const foundPlayer = dataset?.playerData.find((p) => p.name.toLowerCase() === newPlayerName.toLowerCase());
if (!foundPlayer) exit(-1);
const player = formattedToDbPlayer(foundPlayer);
await setPartialAnswer(answer, player, season);
console.timeEnd('setCurrent');
console.log('Finished.');
exit(0);
