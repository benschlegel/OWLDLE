import type { Dataset } from '@/data/datasets';
import { backfillAnonymousStreamerNames } from '@/lib/databaseAccess';
import { exit } from 'node:process';

// Set to a specific dataset to limit scope, or leave undefined for all datasets
const DATASET: Dataset | undefined = undefined;

console.log(`Backfilling streamer-mode names for anonymous entries${DATASET ? ` (dataset="${DATASET}")` : ' (all datasets)'}...`);
const updated = await backfillAnonymousStreamerNames(DATASET);
console.log(`Done. Updated ${updated} documents.`);
exit(0);
