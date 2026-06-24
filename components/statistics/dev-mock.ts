// remove import in StatisticsDashboard to totally remove
import type { StatisticsResponse } from '@/types/statistics';

/** Flip to false (or delete the wiring) to use only real data. */
export const USE_DEV_MOCK = false;

const NAMES = [
	'Profit',
	'Fleta',
	'Gesture',
	'Shu',
	'Proper',
	'Lip',
	'Carpe',
	'Birdring',
	'Saebyeolbe',
	'Fl0w3r',
	'Bdosin',
	'Jjonak',
	'Fearless',
	'Mano',
	'Hydration',
	'Architect',
	'Pine',
	'Libero',
	'Stalk3r',
	'Smurf',
	'Void',
	'Marve1',
	'Anamo',
	'Haksal',
	'Bumper',
	'Closer',
	'Decay',
	'Twilight',
];

const TEAMS = [
	'Seoul Dynasty',
	'Shanghai Dragons',
	'Dallas Fuel',
	'San Francisco Shock',
	'New York Excelsior',
	'Los Angeles Gladiators',
	'Hangzhou Spark',
	'Florida Mayhem',
	'London Spitfire',
	'Atlanta Reign',
	'Philadelphia Fusion',
	'Chengdu Hunters',
	'Toronto Defiant',
	'Houston Outlaws',
	'Vancouver Titans',
	'Washington Justice',
];

/** Deterministic so charts stay stable across renders. */
export function injectDevMock(data: StatisticsResponse): StatisticsResponse {
	const topFirstGuesses = Array.from({ length: 50 }, (_, i) => {
		const round = Math.floor(i / NAMES.length);
		const base = NAMES[i % NAMES.length];
		return { name: round === 0 ? base : `${base} ${round + 1}`, count: 480 - i * 8 };
	});

	const topFirstTeams = TEAMS.map((team, i) => ({ team, count: 360 - i * 18 }));

	const hardestPuzzles = Array.from({ length: 20 }, (_, i) => ({
		iteration: i + 1,
		player: topFirstGuesses[i].name,
		played: 40 + ((i * 7) % 60),
		winRate: 6 + i * 3,
	}));

	const gamesPerDay = Array.from({ length: 30 }, (_, i) => {
		const date = `2026-05-${String(i + 1).padStart(2, '0')}`;
		const played = 40 + Math.round(35 * Math.sin(i / 3) + i);
		const winRate = 45 + Math.round(20 * Math.sin(i / 4));
		return { date, played, winRate };
	});

	const guessDistribution = [
		{ bucket: '1', count: 90 },
		{ bucket: '2', count: 240 },
		{ bucket: '3', count: 410 },
		{ bucket: '4', count: 330 },
		{ bucket: '5', count: 190 },
		{ bucket: '6', count: 95 },
		{ bucket: '7', count: 40 },
		{ bucket: 'failed', count: 120 },
	];

	const wins = guessDistribution.filter((b) => b.bucket !== 'failed').reduce((s, b) => s + b.count, 0);
	const gamesPlayed = wins + 120;

	return {
		...data,
		globalGamesPlayed: 1_284_502,
		summary: {
			gamesPlayed,
			wins,
			losses: gamesPlayed - wins,
			winRate: Math.round((wins / gamesPlayed) * 100),
			averageGuesses: 3.4,
			solvedFirstGuessRate: Math.round((90 / gamesPlayed) * 100),
		},
		guessDistribution,
		topFirstGuesses,
		topFirstTeams,
		gamesPerDay,
		hardestPuzzles,
	};
}
