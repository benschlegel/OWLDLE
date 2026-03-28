import type { Dataset } from '@/data/datasets';
import { migrateGameLogDataset, migrateIterationDataset, migratePlayerDataset } from '@/lib/databaseAccess';
import { exit } from 'node:process';

const migrateFromDataset: Dataset = 'owcs-s2';
const migrateToDataset = 'owcs-s2-stage2';

console.time('migrate');
await migrateIterationDataset(migrateFromDataset, migrateToDataset);
await migrateGameLogDataset(migrateFromDataset, migrateToDataset);
await migratePlayerDataset(migrateFromDataset, migrateToDataset);
console.timeEnd('migrate');
exit(0);
