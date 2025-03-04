import type { Dataset } from '@/data/datasets';
import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { addIteration, getAnswer, getUniqueRandomPlayer, rerollAnswer, setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { trimDate } from '@/lib/utils';
import { exit } from 'node:process';

const dataset: Dataset = 'owcs-s2';
const now = new Date();
const nextReset = trimDate(new Date(Date.UTC(2025, now.getMonth(), now.getDate(), 22, 0, 0)));
// const nextReset = new Date(Date.UTC(2024, now.getMonth(), now.getDate(), 12, 3, 0));
const nextNextReset = new Date(nextReset);
nextNextReset.setDate(nextNextReset.getDate() + 1);

console.time('setAnswers');
// * Insert answers (players get re-rolled later to ensure unique)
const randomPlayer = await getUniqueRandomPlayer(dataset);
const randomPlayer2 = await getUniqueRandomPlayer(dataset);
if (!randomPlayer || !randomPlayer2) {
	console.error(`Did not find random player for dataset ${dataset}.`);
	exit(1);
}
const curr = { player: randomPlayer, iteration: 1, nextReset: nextReset };
await setCurrentAnswer(curr, dataset);
await setNextAnswer({ player: randomPlayer2, iteration: 2, nextReset: nextNextReset }, dataset);

// * Reroll answers to ensure unique
await rerollAnswer('current', dataset);
await rerollAnswer('next', dataset);

// * Set first iteration (get curr_answer data from db)
const dayBefore = new Date(nextReset);
dayBefore.setDate(dayBefore.getDate() - 1);
const currAnswer = await getAnswer('current', dataset);
if (!currAnswer) throw new Error('Could not get current answer');
await addIteration({ iteration: currAnswer.iteration, dataset: dataset, player: currAnswer.player, resetAt: nextReset });
console.timeEnd('setAnswers');
console.log('Finished.');
exit(0);

function getFormattedMidnight(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setDate(midnight.getDate() - 1);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}

function getFormattedMidnightTmrw(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}

function getFormattedMidnightDayAfter(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setDate(midnight.getDate() + 1);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}
