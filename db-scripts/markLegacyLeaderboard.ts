import type { Dataset } from '@/data/datasets';
import { markLegacyLeaderboardEntries } from '@/lib/databaseAccess';
import { GAME_CONFIG } from '@/lib/config';
import { exit } from 'node:process';

// Configure before running
const DATASET: Dataset = 'owcs-s3';
const LEGACY_NAME = 'Anonymous';
const MIN_STREAK = GAME_CONFIG.minLeaderboardStreak;

console.log(`Marking legacy leaderboard entries for dataset="${DATASET}", minStreak=${MIN_STREAK}, name="${LEGACY_NAME}"...`);
const result = await markLegacyLeaderboardEntries(DATASET, MIN_STREAK, LEGACY_NAME);
console.log(`Done. Modified ${result.modifiedCount} documents.`);
exit(0);
