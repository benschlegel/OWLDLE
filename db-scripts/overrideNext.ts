import type { Dataset } from '@/data/datasets';
import { FORMATTED_PLAYERS } from '@/data/players/formattedPlayers';
import { getNextAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

// * config
const dataset: Dataset = 'season3';
const playerId: number | null = null;
const playerName: string | null = 'ChipSa';

const datasetPlayers = FORMATTED_PLAYERS.find((d) => d.dataset === dataset)?.players;
if (!datasetPlayers) {
	console.error(`Unknown dataset: "${dataset}"`);
	exit(1);
}

const foundPlayer =
	playerId !== null ? datasetPlayers.find((p) => p.id === playerId) : datasetPlayers.find((p) => p.name.toLowerCase() === playerName?.toLowerCase());
if (!foundPlayer) {
	console.error(playerId !== null ? `No player with id ${playerId} in dataset "${dataset}"` : `No player named "${playerName}" in dataset "${dataset}"`);
	exit(1);
}

const currentNext = await getNextAnswer(dataset);

const newNext = {
	iteration: currentNext?.iteration ?? 0,
	nextReset: currentNext?.nextReset ?? new Date(),
	player: formattedToDbPlayer(foundPlayer),
};

const result = await setNextAnswer(newNext, dataset);
console.log(result.acknowledged ? `Set next answer to: ${foundPlayer.name}` : 'FAILED');
exit(0);
