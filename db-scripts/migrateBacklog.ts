import { getBacklog, setBacklog } from '@/lib/databaseAccess';
import type { DbPlayer } from '@/types/database';
import { exit } from 'node:process';
import { MongoClient } from 'mongodb';

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

console.time('migrateBacklog');

// Fetch backlog + players collection for owcs-s1
const backlog = await getBacklog(DATASET);
if (!backlog) {
	console.error(`No backlog found for dataset: ${DATASET}`);
	await dbClient.close();
	exit(1);
}

const playersDoc = await playerCollection.findOne({ _id: DATASET });
if (!playersDoc) {
	console.error(`No players collection found for dataset: ${DATASET}`);
	await dbClient.close();
	exit(1);
}

// Build a lookup map from player id -> fresh player data
const playerById = new Map<number, DbPlayer>();
for (const player of playersDoc.players) {
	playerById.set(player.id, player);
}

// Replace each backlog entry with fresh data from players collection, preserving order
let modifiedCount = 0;
const updatedPlayers: DbPlayer[] = backlog.players.map((backlogPlayer) => {
	const freshPlayer = playerById.get(backlogPlayer.id);
	if (!freshPlayer) {
		console.warn(`No matching player found in players collection for id: ${backlogPlayer.id} (${backlogPlayer.name})`);
		return backlogPlayer;
	}

	// Check if any field differs
	const isSame = JSON.stringify(backlogPlayer) === JSON.stringify(freshPlayer);
	if (!isSame) {
		modifiedCount++;
	}

	return freshPlayer;
});

// Write updated backlog back to db
await setBacklog({ _id: DATASET, players: updatedPlayers });

await dbClient.close();

console.timeEnd('migrateBacklog');
console.log(`Done. Modified ${modifiedCount} / ${backlog.players.length} backlog entries.`);
exit(0);
