import { exit } from 'node:process';
import { MongoClient } from 'mongodb';
import { getBacklog, getNextAnswer, setBacklog, setPartialAnswer } from '@/lib/databaseAccess';
import type { DbPlayer } from '@/types/database';

// * config
const DATASET = 'owcs-s1';

const uri = process.env.MONGO_URI;
if (!uri) {
	throw new Error('MONGO_URI not found! Make sure to set MONGO_URI in your .env');
}

const useDevDatabase = process.env.NODE_ENV !== 'production';
const dbName = useDevDatabase ? 'OWLEL-dev' : 'OWLEL';

const dbClient = new MongoClient(uri);
const database = dbClient.db(dbName);
const playerCollection = database.collection<{ _id: string; players: DbPlayer[] }>('players');

console.time('refreshDataset');

const playersDoc = await playerCollection.findOne({ _id: DATASET });
if (!playersDoc) {
	console.error(`No players collection found for dataset: ${DATASET}`);
	await dbClient.close();
	exit(1);
}

const playerById = new Map<number, DbPlayer>();
for (const player of playersDoc.players) {
	playerById.set(player.id, player);
}

// Refresh backlog
const backlog = await getBacklog(DATASET);
if (!backlog) {
	console.error(`No backlog found for dataset: ${DATASET}`);
	await dbClient.close();
	exit(1);
}

let backlogModified = 0;
const updatedBacklog: DbPlayer[] = backlog.players.map((entry) => {
	const fresh = playerById.get(entry.id);
	if (!fresh) {
		console.warn(`No matching player in players collection for id: ${entry.id} (${entry.name})`);
		return entry;
	}
	if (JSON.stringify(entry) !== JSON.stringify(fresh)) backlogModified++;
	return fresh;
});

await setBacklog({ _id: DATASET, players: updatedBacklog });
console.log(`Backlog: updated ${backlogModified} / ${backlog.players.length} entries.`);

// Refresh next answer
const nextAnswer = await getNextAnswer(DATASET);
if (!nextAnswer) {
	console.warn(`No next answer found for dataset: ${DATASET} — skipping.`);
} else {
	const freshNext = playerById.get(nextAnswer.player.id);
	if (!freshNext) {
		console.warn(`Next answer player id ${nextAnswer.player.id} not found in players collection, skipping.`);
	} else {
		await setPartialAnswer('next', freshNext, DATASET);
		console.log(`Next answer: refreshed player "${freshNext.name}".`);
	}
}

await dbClient.close();
console.timeEnd('refreshDataset');
exit(0);
