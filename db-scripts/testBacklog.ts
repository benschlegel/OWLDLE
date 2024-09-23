import { getCurrentAnswer, getNextAnswer, generateBacklog, getBacklog } from '@/lib/databaseAccess';
import { exit } from 'node:process';

const currAnswer = await getCurrentAnswer('OWL_season1');
const nextAnswer = await getNextAnswer('OWL_season1');
console.time('backlog');
for (let i = 0; i < 1; i++) {
	await generateBacklog(125, 'OWL_season1');

	setTimeout(async () => {
		const backlog = await getBacklog('OWL_season1');
		let currIndex = -1;
		const currDuplicate = backlog?.players.find((player, i) => {
			currIndex = i;
			return player.name === currAnswer?.player.name;
		});
		const nextDuplicate = backlog?.players.find((player, i) => {
			currIndex = i;
			return player.name === nextAnswer?.player.name;
		});

		if (currDuplicate !== undefined || nextDuplicate !== undefined) {
			console.error(`Duplicate found!\n${currDuplicate?.name} (${currIndex})\n${nextDuplicate?.name} (${currIndex})`);
		}
	}, 100);
	console.log('---');
	console.timeEnd('backlog');
}

exit(0);
