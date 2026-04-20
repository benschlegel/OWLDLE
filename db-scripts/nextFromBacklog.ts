import { getNextAnswer, popBacklog, setNextAnswer } from '@/lib/databaseAccess';
import { exit } from 'node:process';

const dataset = 'owcs-s3';

const currentNext = await getNextAnswer(dataset);
console.log('Current next answer:', currentNext?.player.name);

const { poppedPlayer, newLength } = await popBacklog(dataset);
if (!poppedPlayer) {
	console.error('Backlog is empty!');
	exit(1);
}

console.log('Popped from backlog:', poppedPlayer.name, `(${newLength} remaining)`);

const newNext = {
	iteration: (currentNext?.iteration ?? 0),
	nextReset: currentNext?.nextReset ?? new Date(),
	player: poppedPlayer,
};

const result = await setNextAnswer(newNext, dataset);
console.log('Set next answer:', result.acknowledged ? 'OK' : 'FAILED');
console.log('New next answer:', poppedPlayer.name);
exit(0);
