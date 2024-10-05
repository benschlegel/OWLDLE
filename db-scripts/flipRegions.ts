import type { Dataset } from '@/data/datasets';
import { getAnswer, setPartialAnswer } from '@/lib/databaseAccess';
import type { DbAnswerPrefix } from '@/types/database';
import type { Region } from '@/types/players';
import { exit } from 'node:process';

const answerPrefix: DbAnswerPrefix = 'current';

const s1 = await getAnswer(answerPrefix, 'season1');
const s2 = await getAnswer(answerPrefix, 'season2');
const s3 = await getAnswer(answerPrefix, 'season3');

if (!s1 || !s2 || !s3) exit(1);

const seasons = [s1, s2, s3];
const seasonDatasets: Dataset[] = ['season1', 'season2', 'season3'];

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
console.log('Done.');
exit(0);
// current: AD, PD, PD
// expected: PP, AD, AD
