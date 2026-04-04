import type { Dataset } from '@/data/datasets';
import { convertLegacyToAnonymousFormat } from '@/lib/databaseAccess';
import { exit } from 'node:process';

// Set to a specific dataset to limit scope, or leave undefined for all datasets
const DATASET: Dataset | undefined = undefined;

console.log(`Converting legacy 'Anonymous' entries to new anonymous format${DATASET ? ` (dataset="${DATASET}")` : ' (all datasets)'}...`);
const updated = await convertLegacyToAnonymousFormat(DATASET);
console.log(`Done. Updated ${updated} documents.`);
exit(0);
