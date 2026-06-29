// Deletes <dataset>__staging documents from database (which can be caused if switchStage gets interrupted)

import type { Dataset } from '@/data/datasets';
import { database } from '@/lib/databaseAccess';
import { cleanupStaging, stagingKey } from '@/lib/stageSwitch';
import { exit } from 'node:process';

// ! Configure the base dataset key whose staging records should be removed.
const BASE: Dataset = 'owcs-s3';

console.log(`Cleaning up staging records under '${stagingKey(BASE)}' ...`);
console.time('cleanStaging');
await cleanupStaging(database, BASE);
console.timeEnd('cleanStaging');
console.log('Staging cleanup complete. You can now re-run switchStage.');
exit(0);
