import type { Dataset } from '@/data/datasets';
import { getAnswer, getBacklog, setBacklog, setPartialAnswer } from '@/lib/databaseAccess';
import type { DbAnswerPrefix } from '@/types/database';
import type { Region } from '@/types/players';
import { exit } from 'node:process';

const answerPrefix: DbAnswerPrefix = 'current';

const seasonDatasets: Dataset[] = ['season1', 'season2', 'season3'];

async function flipAnswerRegions() {
	const s1 = await getAnswer(answerPrefix, 'season1');
	const s2 = await getAnswer(answerPrefix, 'season2');
	const s3 = await getAnswer(answerPrefix, 'season3');

	if (!s1 || !s2 || !s3) exit(1);
	const seasons = [s1, s2, s3];
	for (let i = 0; i < seasons.length; i++) {
		const season = seasons[i];
		let newRegion: Region | undefined = undefined;
		if (season?.player.region === 'AtlanticDivison') {
			newRegion = 'PacificDivision';
		} else if (season?.player.region === 'PacificDivision') {
			newRegion = 'AtlanticDivison';
		}
		console.log(`${season.player.name}: [${season.player.region} -> ${newRegion}]`);
		season.player.region = newRegion;
		await setPartialAnswer(answerPrefix, season.player, seasonDatasets[i]);
	}
}

for (const season of seasonDatasets) {
	const backlog = await getBacklog(season);
	if (!backlog) {
		console.error('Backlog not found.');
		exit(1);
	}

	for (const player of backlog.players) {
		if (player.region === 'AtlanticDivison') {
			player.region = 'PacificDivision';
		} else if (player.region === 'PacificDivision') {
			player.region = 'AtlanticDivison';
		}
	}

	await setBacklog({ _id: backlog._id, players: backlog.players });
}

console.log('Done.');
exit(0);
// current: AD, PD, PD
// expected: PP, AD, AD
// S4: assassin, P
// S1: [Gesture, P], [sleepy, A]
// S2: [cloudy, P]
// S3: [Void, A]
