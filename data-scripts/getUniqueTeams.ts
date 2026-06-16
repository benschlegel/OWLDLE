import { DATASETS, type Dataset } from '@/data/datasetIds';
import { ALL_PLAYERS } from '@/data/players/players';

// ! Change this value for different script output
const DATASET: Dataset = 'owcs-s1';

const datasetIndex = DATASETS.indexOf(DATASET);
const players = ALL_PLAYERS[datasetIndex] ?? [];

const seen = new Set<string>();
const uniqueTeams: string[] = [];
for (const player of players) {
  if (!seen.has(player.team)) {
    seen.add(player.team);
    uniqueTeams.push(player.team);
  }
}

console.log(`Found ${uniqueTeams.length} unique teams from ${players.length} players in '${DATASET}':\n`);
console.log(JSON.stringify(uniqueTeams, null, 2));
