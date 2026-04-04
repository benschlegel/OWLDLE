import type { NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';
import { GAME_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

const NAMES = [
	'ProSniper',
	'OwlFan42',
	'TracerMain',
	'DVaMaster',
	'Reinhardt99',
	'MercyPls',
	'GejiGod',
	'SombraHack',
	'LucioBeats',
	'ZenyattaOrb',
	'AnaGranny',
	'RoadhogHook',
	'JunkratBoom',
	'PharahSkies',
	'BapField',
	'WidowMaker1',
	'WinstonLab',
	'SigmaFlux',
	'Kiriko2026',
	'LifeWeaver',
	'EchoClone',
	'SojoSprint',
	'RammCharge',
	'JunoHeal',
	'MarbleSlam',
	'VentureDig',
	'HazardToxic',
	'AceShot',
	'FlareDash',
	'NovaPulse',
	'BladeRunner',
	'PixelPro',
	'StormRider',
	'GhostSnipe',
	'TurboFrag',
	'NeonStreak',
	'VoltEdge',
	'IronClad',
	'MysticOWL',
	'DarkPhoenix',
	'CyberNinja',
	'QuantumLeap',
	'ThunderBolt',
	'FrostByte',
	'WarpDrive',
	'ZeroGravity',
	'AlphaStrike',
	'OmegaShift',
	'DeltaForce',
	'SigmaGrind',
];

/**
 * dev only, seed fake leaderboard entries for testing.
 * POST /api/endless/leaderboard/seed?dataset=owcs-s3&myClientId=<uuid>
 */
export async function POST(request: NextRequest) {
	if (process.env.NODE_ENV === 'production') {
		return Response.json({ error: 'Not available in production.' }, { status: 403 });
	}

	const params = request.nextUrl.searchParams;
	const dataset = params.get('dataset') ?? 'owcs-s3';
	const myClientId = params.get('myClientId');
	const count = Math.min(100, Math.max(1, Number(params.get('count') ?? 55)));
	const pageSize = GAME_CONFIG.leaderboardPageSize;

	const uri = process.env.MONGO_URI;
	if (!uri) return Response.json({ error: 'No MONGO_URI' }, { status: 500 });

	const client = new MongoClient(uri);
	// Temp set to true, guard for env === prod at start already.
	const useDevDatabase = true;
	const db = client.db(useDevDatabase ? 'OWLEL-dev' : 'OWLEL');
	const collection = db.collection('endless_game_logs');

	const now = Date.now();
	const docs = [];

	for (let i = 0; i < count; i++) {
		// Streak decreases as rank increases (rank 1 = highest streak)
		const streakLength = Math.max(4, count - i + Math.floor(Math.random() * 3));
		const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? `_${Math.floor(i / NAMES.length)}` : '');
		const clientId = crypto.randomUUID();
		const finishedAt = new Date(now - (count - i) * 3600_000); // spread over time

		// Build plausible games array
		const games = [];
		for (let g = 0; g < streakLength; g++) {
			games.push({
				guessCount: Math.floor(Math.random() * 6) + 1,
				result: 'won' as const,
				completedAt: finishedAt.getTime() - (streakLength - g) * 30_000,
			});
		}
		games.push({
			guessCount: 7,
			result: 'lost' as const,
			completedAt: finishedAt.getTime(),
		});

		docs.push({
			dataset,
			streakLength,
			games,
			finishedAt,
			name,
			clientId,
		});
	}

	// Insert user's own entry on page 4 (rank ~35)
	if (myClientId) {
		const targetRank = pageSize * 3 + 5; // page 4, position 5
		const userStreak = Math.max(4, count - targetRank + 4);
		const userFinishedAt = new Date(now - 1800_000);
		const userGames = [];
		for (let g = 0; g < userStreak; g++) {
			userGames.push({
				guessCount: Math.floor(Math.random() * 5) + 1,
				result: 'won' as const,
				completedAt: userFinishedAt.getTime() - (userStreak - g) * 30_000,
			});
		}
		userGames.push({
			guessCount: 7,
			result: 'lost' as const,
			completedAt: userFinishedAt.getTime(),
		});

		docs.push({
			dataset,
			streakLength: userStreak,
			games: userGames,
			finishedAt: userFinishedAt,
			name: 'Me',
			clientId: myClientId,
		});
	}

	const result = await collection.insertMany(docs);
	await client.close();

	return Response.json({
		inserted: result.insertedCount,
		message: `Seeded ${result.insertedCount} entries for ${dataset}`,
		...(myClientId && { yourEntry: `Name: Me, ~rank ${pageSize * 3 + 5}` }),
	});
}
