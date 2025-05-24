import { migrateGameLogDataset, migrateIterationDataset, migratePlayerDataset } from '@/lib/databaseAccess';
import { exit } from 'node:process';

console.time('migrate');
await migrateIterationDataset('owcs-s2', 'owcs-s2-stage1');
await migrateGameLogDataset('owcs-s2', 'owcs-s2-stage1');
await migratePlayerDataset('owcs-s2', 'owcs-s2-stage1');
console.timeEnd('migrate');
exit(0);
