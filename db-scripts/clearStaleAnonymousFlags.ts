import type { Dataset } from '@/data/datasets';
import { clearStaleAnonymousFlags } from '@/lib/databaseAccess';
import { exit } from 'node:process';

// Set to a specific dataset to limit scope, or leave undefined for all datasets
const DATASET: Dataset | undefined = undefined;

console.log(`Clearing stale anonymous flags from named entries${DATASET ? ` (dataset="${DATASET}")` : ' (all datasets)'}...`);
const updated = await clearStaleAnonymousFlags(DATASET);
console.log(`Done. Updated ${updated} documents.`);
exit(0);
