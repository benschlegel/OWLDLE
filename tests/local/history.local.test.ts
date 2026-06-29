import { describe, expect, test, beforeEach } from 'vitest';
import { getAllRawHistory, getRawHistory, getRawHistoryDetail, getStatisticsCollections } from '@/lib/databaseAccess';
import { shapeHistoryList, shapeHistoryDetail } from '@/lib/history';
import type { StageOption } from '@/types/statistics';
import type { Dataset } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';

const ds: Dataset = 'season1';
const SINGLE_STAGE: StageOption[] = [{ value: 'current', label: 'Latest stage' }];

async function clearCollections() {
	const { gameLogCollection, iterationCollection, answerCollection } = getStatisticsCollections();
	await Promise.all([
		gameLogCollection.deleteMany({ dataset: { $regex: `^${ds}` } as any }),
		iterationCollection.deleteMany({ dataset: { $regex: `^${ds}` } as any }),
		answerCollection.deleteMany({ _id: { $regex: `^current_${ds}` } as any }),
	]);
}

function makeLog(opts: {
	dataset?: Dataset;
	iteration?: number;
	gameResult: 'won' | 'lost';
	finishedAt: Date;
	gameData: { player: { name: string; id: number } }[];
}) {
	return {
		dataset: opts.dataset ?? ds,
		iteration: opts.iteration ?? 1,
		gameResult: opts.gameResult,
		finishedAt: opts.finishedAt,
		gameData: opts.gameData.map((g) => ({ guessResult: {}, player: g.player })),
	};
}

function makeIteration(iteration: number, playerName: string, dataset: Dataset = ds) {
	return {
		dataset,
		iteration,
		resetAt: new Date(`2026-01-${String(iteration).padStart(2, '0')}T12:00:00Z`),
		player: { name: playerName, id: iteration, role: 'Damage', team: 'BostonUprising', country: 'US', region: 'NA' },
	};
}

async function seedCurrentAnswer(iteration: number, dataset: Dataset = ds) {
	const { answerCollection } = getStatisticsCollections();
	await answerCollection.updateOne(
		{ _id: `current_${dataset}` as any },
		{
			$set: {
				_id: `current_${dataset}`,
				iteration,
				nextReset: new Date('2026-06-30T12:00:00Z'),
				player: { name: 'Current', id: 99, role: 'Damage', team: 'BostonUprising', country: 'US', region: 'NA' },
			},
		},
		{ upsert: true }
	);
}

async function seedIterations(iterations: { iteration: number; playerName: string; dataset?: Dataset }[]) {
	const { iterationCollection } = getStatisticsCollections();
	await iterationCollection.insertMany(iterations.map((i) => makeIteration(i.iteration, i.playerName, i.dataset ?? ds)) as any);
}

async function seedLogs(logs: Parameters<typeof makeLog>[0][]) {
	const { gameLogCollection } = getStatisticsCollections();
	await gameLogCollection.insertMany(logs.map(makeLog) as any);
}

describe('getRawHistory — no spoiler', () => {
	beforeEach(clearCollections);

	test('excludes the current iteration; returns exactly N-1 entries', async () => {
		await seedCurrentAnswer(5);
		await seedIterations([1, 2, 3, 4, 5].map((i) => ({ iteration: i, playerName: `Player${i}` })));
		await seedLogs([makeLog({ iteration: 1, gameResult: 'won', finishedAt: new Date('2026-01-01T14:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] })]);

		const { entries } = await getRawHistory(ds);
		expect(entries).toHaveLength(4);
		expect(entries.every((e) => e.iteration < 5)).toBe(true);
		expect(entries.find((e) => e.iteration === 5)).toBeUndefined();
	});
});

describe('getRawHistory — ordering', () => {
	beforeEach(clearCollections);

	test('entries are iteration-descending', async () => {
		await seedCurrentAnswer(4);
		await seedIterations([1, 2, 3].map((i) => ({ iteration: i, playerName: `Player${i}` })));

		const { entries } = await getRawHistory(ds);
		expect(entries).toHaveLength(3);
		expect(entries[0].iteration).toBe(3);
		expect(entries[1].iteration).toBe(2);
		expect(entries[2].iteration).toBe(1);
	});
});

describe('getRawHistory — win rate and zero-game days', () => {
	beforeEach(clearCollections);

	test('3 wins / 4 played => winRate 75 after shaping; zero-game day has played:0 winRate:0', async () => {
		await seedCurrentAnswer(3);
		await seedIterations([
			{ iteration: 1, playerName: 'Iter1' },
			{ iteration: 2, playerName: 'Iter2' },
		]);
		await seedLogs([
			makeLog({ iteration: 1, gameResult: 'won', finishedAt: new Date('2026-01-01T10:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
			makeLog({ iteration: 1, gameResult: 'won', finishedAt: new Date('2026-01-01T11:00:00Z'), gameData: [{ player: { name: 'B', id: 1 } }] }),
			makeLog({ iteration: 1, gameResult: 'won', finishedAt: new Date('2026-01-01T12:00:00Z'), gameData: [{ player: { name: 'C', id: 2 } }] }),
			makeLog({ iteration: 1, gameResult: 'lost', finishedAt: new Date('2026-01-01T13:00:00Z'), gameData: [{ player: { name: 'D', id: 3 } }] }),
			// iteration 2 has no logs
		]);

		const { entries } = await getRawHistory(ds);
		const shaped = shapeHistoryList(ds, entries, SINGLE_STAGE);

		const e1 = shaped.entries.find((e) => e.iteration === 1);
		expect(e1).toBeDefined();
		expect(e1?.played).toBe(4);
		expect(e1?.winRate).toBe(75);

		const e2 = shaped.entries.find((e) => e.iteration === 2);
		expect(e2).toBeDefined();
		expect(e2?.played).toBe(0);
		expect(e2?.winRate).toBe(0);
	});
});

describe('getRawHistory — player name', () => {
	beforeEach(clearCollections);

	test('player name comes from iteration doc', async () => {
		await seedCurrentAnswer(2);
		await seedIterations([{ iteration: 1, playerName: 'FamousPlayer' }]);

		const { entries } = await getRawHistory(ds);
		expect(entries[0].player).toBe('FamousPlayer');
	});
});

describe('getRawHistory — cursor pagination', () => {
	beforeEach(clearCollections);

	test('first page returns limit entries + nextCursor; second page returns the rest', async () => {
		// 5 past iterations, fetch 2 at a time
		await seedCurrentAnswer(6);
		await seedIterations([1, 2, 3, 4, 5].map((i) => ({ iteration: i, playerName: `P${i}` })));

		const page1 = await getRawHistory(ds, 2);
		expect(page1.entries).toHaveLength(2);
		expect(page1.entries[0].iteration).toBe(5); // latest first
		expect(page1.entries[1].iteration).toBe(4);
		expect(page1.nextCursor).toBe(4); // cursor = last entry's iteration

		const page2 = await getRawHistory(ds, 2, page1.nextCursor ?? undefined);
		expect(page2.entries).toHaveLength(2);
		expect(page2.entries[0].iteration).toBe(3);
		expect(page2.entries[1].iteration).toBe(2);
		expect(page2.nextCursor).toBe(2);

		const page3 = await getRawHistory(ds, 2, page2.nextCursor ?? undefined);
		expect(page3.entries).toHaveLength(1);
		expect(page3.entries[0].iteration).toBe(1);
		expect(page3.nextCursor).toBeNull(); // last page
	});
});

describe('getRawHistoryDetail — happy path', () => {
	beforeEach(clearCollections);

	test('summary counts match seeded logs; guessDistribution has maxGuesses+1 buckets in order', async () => {
		const maxGuesses = GAME_CONFIG.maxGuesses;
		await seedCurrentAnswer(3);
		await seedIterations([
			{ iteration: 1, playerName: 'AnswerPlayer' },
			{ iteration: 2, playerName: 'AnswerPlayer2' },
		]);
		await seedLogs([
			makeLog({ iteration: 1, gameResult: 'won', finishedAt: new Date('2026-01-01T10:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
			makeLog({
				iteration: 1,
				gameResult: 'won',
				finishedAt: new Date('2026-01-01T11:00:00Z'),
				gameData: [{ player: { name: 'A', id: 0 } }, { player: { name: 'B', id: 1 } }],
			}),
			makeLog({ iteration: 1, gameResult: 'lost', finishedAt: new Date('2026-01-01T12:00:00Z'), gameData: [{ player: { name: 'C', id: 2 } }] }),
		]);

		const raw = await getRawHistoryDetail(ds, 1);
		expect(raw).not.toBeNull();
		if (!raw) return;

		expect(raw.summary.gamesPlayed).toBe(3);
		expect(raw.summary.wins).toBe(2);
		expect(raw.summary.winGuessSum).toBe(3); // 1+2
		expect(raw.summary.solvedFirst).toBe(1);
		expect(raw.player).toBe('AnswerPlayer');

		const shaped = shapeHistoryDetail(ds, raw, maxGuesses);
		expect(shaped.guessDistribution).toHaveLength(maxGuesses + 1);
		expect(shaped.guessDistribution[0]).toMatchObject({ bucket: '1' });
		expect(shaped.guessDistribution[maxGuesses]).toMatchObject({ bucket: 'failed' });
		const buckets = shaped.guessDistribution.map((b) => b.bucket);
		expect(buckets).toEqual([...Array.from({ length: maxGuesses }, (_, i) => String(i + 1)), 'failed']);
	});
});

describe('getRawHistoryDetail — spoiler guard', () => {
	beforeEach(clearCollections);

	test('returns null for current iteration, future iterations, and nonexistent past iterations', async () => {
		await seedCurrentAnswer(5);
		await seedIterations([{ iteration: 3, playerName: 'P3' }]);

		expect(await getRawHistoryDetail(ds, 5)).toBeNull(); // current
		expect(await getRawHistoryDetail(ds, 6)).toBeNull(); // future
		expect(await getRawHistoryDetail(ds, 2)).toBeNull(); // past but no iteration doc
	});
});

describe('getAllRawHistory — multi-stage', () => {
	beforeEach(clearCollections);

	const stageKey = `${ds}-stage1`;
	const STAGES: StageOption[] = [
		{ value: 'all', label: 'All stages' },
		{ value: 'current', label: 'Stage 2' },
		{ value: '1', label: 'Stage 1' },
	];

	test('excludes the live base current iteration but includes all archived-stage iterations', async () => {
		await seedCurrentAnswer(3); // live base current = 3
		await seedIterations([
			{ iteration: 1, playerName: 'BaseP1' },
			{ iteration: 2, playerName: 'BaseP2' },
			{ iteration: 3, playerName: 'BaseP3' }, // current → excluded
		]);
		// archived stage1 has no current answer → all included, even high iterations
		await seedIterations([
			{ iteration: 1, playerName: 'StageP1', dataset: stageKey as Dataset },
			{ iteration: 2, playerName: 'StageP2', dataset: stageKey as Dataset },
		]);

		const entries = await getAllRawHistory(ds, [ds, stageKey]);
		const base = entries.filter((e) => e.datasetKey === ds);
		const stage = entries.filter((e) => e.datasetKey === stageKey);
		expect(base.map((e) => e.iteration).sort()).toEqual([1, 2]); // 3 excluded
		expect(stage.map((e) => e.iteration).sort()).toEqual([1, 2]); // all included
	});

	test('iteration 1 in base and stage1 are kept as separate entries; shaping sorts newest stage first', async () => {
		await seedCurrentAnswer(2);
		await seedIterations([{ iteration: 1, playerName: 'BaseP1' }]);
		await seedIterations([{ iteration: 1, playerName: 'StageP1', dataset: stageKey as Dataset }]);
		await seedLogs([
			makeLog({ iteration: 1, gameResult: 'won', finishedAt: new Date('2026-01-01T10:00:00Z'), gameData: [{ player: { name: 'A', id: 0 } }] }),
			makeLog({
				dataset: stageKey as Dataset,
				iteration: 1,
				gameResult: 'lost',
				finishedAt: new Date('2026-01-01T10:00:00Z'),
				gameData: [{ player: { name: 'B', id: 1 } }],
			}),
		]);

		const entries = await getAllRawHistory(ds, [ds, stageKey]);
		expect(entries).toHaveLength(2);

		const shaped = shapeHistoryList(ds, entries, STAGES);
		// Current stage (Stage 2) sorts before archived Stage 1.
		expect(shaped.entries[0].datasetKey).toBe(ds);
		expect(shaped.entries[0].stageLabel).toBe('Stage 2');
		expect(shaped.entries[1].datasetKey).toBe(stageKey);
		expect(shaped.entries[1].stageLabel).toBe('Stage 1');
		expect(shaped.entries[1].stageNumber).toBe(1);
	});

	test('detail honors stage keys: archived stage has no spoiler guard', async () => {
		await seedCurrentAnswer(2); // live base current = 2
		await seedIterations([{ iteration: 5, playerName: 'StageP5', dataset: stageKey as Dataset }]);
		await seedLogs([
			makeLog({
				dataset: stageKey as Dataset,
				iteration: 5,
				gameResult: 'won',
				finishedAt: new Date('2026-01-05T10:00:00Z'),
				gameData: [{ player: { name: 'A', id: 0 } }],
			}),
		]);

		// iteration 5 would be "future" for the base, but on an archived stage there's no guard.
		const raw = await getRawHistoryDetail(stageKey, 5);
		expect(raw).not.toBeNull();
		expect(raw?.player).toBe('StageP5');
		expect(raw?.summary.gamesPlayed).toBe(1);
	});
});
