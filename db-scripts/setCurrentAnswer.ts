import { exit } from 'node:process';
import * as readline from 'node:readline';
import { DATASETS, type Dataset } from '@/data/datasetIds';
import { FORMATTED_PLAYERS } from '@/data/players/formattedPlayers';
import { getCurrentAnswer, setCurrentAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';

if (process.env.NODE_ENV === 'production') {
	console.error('This script cannot be run in production.');
	exit(1);
}

function ask(question: string, completions: string[]): Promise<string> {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			completer: (line: string): [string[], string] => {
				const hits = completions.filter((c) => c.toLowerCase().startsWith(line.toLowerCase()));
				return [hits.length ? hits : completions, line];
			},
		});
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

// Step 1: pick dataset
console.log(`Available datasets: ${DATASETS.join(', ')}`);
const datasetInput = await ask('Dataset: ', [...DATASETS]);

if (!(DATASETS as readonly string[]).includes(datasetInput)) {
	console.error(`Unknown dataset: "${datasetInput}"`);
	exit(1);
}

const dataset = datasetInput as Dataset;
const datasetPlayers = FORMATTED_PLAYERS.find((d) => d.dataset === dataset)?.players ?? [];

if (datasetPlayers.length === 0) {
	console.error(`No players found for dataset "${dataset}"`);
	exit(1);
}

// Step 2: pick player
const playerNames = datasetPlayers.map((p) => p.name);
console.log(`\n${playerNames.length} players in "${dataset}". Type a name (tab to autocomplete).`);
const playerInput = await ask('Player name: ', playerNames);

const foundPlayer = datasetPlayers.find((p) => p.name.toLowerCase() === playerInput.toLowerCase());
if (!foundPlayer) {
	console.error(`No player named "${playerInput}" in dataset "${dataset}"`);
	exit(1);
}

const current = await getCurrentAnswer(dataset);
if (!current) {
	console.error(`No current answer found for dataset "${dataset}". Cannot preserve iteration/nextReset.`);
	exit(1);
}

const newAnswer = {
	iteration: current.iteration,
	nextReset: current.nextReset,
	player: formattedToDbPlayer(foundPlayer),
};

const result = await setCurrentAnswer(newAnswer, dataset);
console.log(result.acknowledged ? `Set current answer to: ${foundPlayer.name}` : 'FAILED');
exit(0);
