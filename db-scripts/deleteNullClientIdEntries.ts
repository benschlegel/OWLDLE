import type { Dataset } from '@/data/datasets';
import { deleteNullClientIdEntries } from '@/lib/databaseAccess';
import { exit } from 'node:process';

// Set to a specific dataset to limit scope, or leave undefined for all datasets
const DATASET: Dataset | undefined = undefined;

console.log(`Deleting null-clientId endless log entries${DATASET ? ` (dataset="${DATASET}")` : ' (all datasets)'}...`);
const deleted = await deleteNullClientIdEntries(DATASET);
console.log(`Done. Deleted ${deleted} documents.`);
exit(0);
