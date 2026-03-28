import { describe, expect, test, beforeEach } from 'vitest';
import { usePlayerStatsStore, readablePlayerStats, emptyStats, type PlayerStats } from '@/store/player-stats-store';
import type { Dataset } from '@/data/datasets';

// Reset store state before each test
beforeEach(() => {
	usePlayerStatsStore.setState({ datasets: {} });
});

const ds1: Dataset = 'season1';
const ds2: Dataset = 'owcs-s2';

function getStats(dataset: Dataset): PlayerStats {
	return usePlayerStatsStore.getState().getStats(dataset);
}

describe('player stats store - initial state', () => {
	test('returns empty stats for unknown dataset', () => {
		expect(getStats(ds1)).toEqual(emptyStats);
	});

	test('empty stats have zero values and empty distribution', () => {
		const stats = getStats(ds1);
		expect(stats.games).toBe(0);
		expect(stats.wins).toBe(0);
		expect(stats.currentStreak).toBe(0);
		expect(stats.highestStreak).toBe(0);
		expect(stats.distribution).toEqual([]);
	});
});

describe('player stats store - recordWin', () => {
	test('single win increments games, wins, and streak', () => {
		usePlayerStatsStore.getState().recordWin(ds1, 3);
		const stats = getStats(ds1);
		expect(stats.games).toBe(1);
		expect(stats.wins).toBe(1);
		expect(stats.currentStreak).toBe(1);
		expect(stats.highestStreak).toBe(1);
	});

	test('win in N guesses records distribution at index N', () => {
		usePlayerStatsStore.getState().recordWin(ds1, 5);
		const stats = getStats(ds1);
		expect(stats.distribution[5]).toBe(1);
		// Indices 0-4 should be filled with 0
		expect(stats.distribution[0]).toBe(0);
		expect(stats.distribution[1]).toBe(0);
		expect(stats.distribution[4]).toBe(0);
	});

	test('multiple wins at different guess counts build distribution correctly', () => {
		const { recordWin } = usePlayerStatsStore.getState();
		recordWin(ds1, 1);
		recordWin(ds1, 1);
		recordWin(ds1, 3);
		recordWin(ds1, 7);
		const stats = getStats(ds1);
		expect(stats.distribution[1]).toBe(2);
		expect(stats.distribution[3]).toBe(1);
		expect(stats.distribution[7]).toBe(1);
		expect(stats.games).toBe(4);
		expect(stats.wins).toBe(4);
	});

	test('consecutive wins build streak and highest streak', () => {
		const { recordWin } = usePlayerStatsStore.getState();
		recordWin(ds1, 2);
		recordWin(ds1, 3);
		recordWin(ds1, 4);
		const stats = getStats(ds1);
		expect(stats.currentStreak).toBe(3);
		expect(stats.highestStreak).toBe(3);
	});
});

describe('player stats store - recordLoss', () => {
	test('single loss increments games but not wins, resets streak', () => {
		usePlayerStatsStore.getState().recordLoss(ds1);
		const stats = getStats(ds1);
		expect(stats.games).toBe(1);
		expect(stats.wins).toBe(0);
		expect(stats.currentStreak).toBe(0);
		expect(stats.highestStreak).toBe(0);
	});

	test('loss records distribution at index 0 (failed)', () => {
		usePlayerStatsStore.getState().recordLoss(ds1);
		const stats = getStats(ds1);
		expect(stats.distribution[0]).toBe(1);
	});

	test('multiple losses accumulate at index 0', () => {
		const { recordLoss } = usePlayerStatsStore.getState();
		recordLoss(ds1);
		recordLoss(ds1);
		recordLoss(ds1);
		const stats = getStats(ds1);
		expect(stats.distribution[0]).toBe(3);
		expect(stats.games).toBe(3);
		expect(stats.wins).toBe(0);
	});
});

describe('player stats store - streaks', () => {
	test('loss after wins resets current streak but preserves highest', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		recordWin(ds1, 2);
		recordWin(ds1, 3);
		recordWin(ds1, 1);
		expect(getStats(ds1).currentStreak).toBe(3);
		expect(getStats(ds1).highestStreak).toBe(3);

		recordLoss(ds1);
		expect(getStats(ds1).currentStreak).toBe(0);
		expect(getStats(ds1).highestStreak).toBe(3);
	});

	test('new streak after loss does not overwrite higher old streak', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		// Build streak of 5
		for (let i = 0; i < 5; i++) recordWin(ds1, 2);
		expect(getStats(ds1).highestStreak).toBe(5);

		recordLoss(ds1);
		// Build new streak of 2
		recordWin(ds1, 3);
		recordWin(ds1, 4);
		expect(getStats(ds1).currentStreak).toBe(2);
		expect(getStats(ds1).highestStreak).toBe(5);
	});

	test('new streak exceeding old highest updates highest', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		// Build streak of 2
		recordWin(ds1, 1);
		recordWin(ds1, 1);
		recordLoss(ds1);
		expect(getStats(ds1).highestStreak).toBe(2);

		// Build streak of 4
		for (let i = 0; i < 4; i++) recordWin(ds1, 1);
		expect(getStats(ds1).currentStreak).toBe(4);
		expect(getStats(ds1).highestStreak).toBe(4);
	});

	test('loss when streak is already 0 keeps it at 0', () => {
		const { recordLoss } = usePlayerStatsStore.getState();
		recordLoss(ds1);
		recordLoss(ds1);
		expect(getStats(ds1).currentStreak).toBe(0);
		expect(getStats(ds1).highestStreak).toBe(0);
	});
});

describe('player stats store - dataset isolation', () => {
	test('stats are independent across datasets', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		recordWin(ds1, 2);
		recordWin(ds1, 3);
		recordLoss(ds2);

		const stats1 = getStats(ds1);
		const stats2 = getStats(ds2);

		expect(stats1.games).toBe(2);
		expect(stats1.wins).toBe(2);
		expect(stats1.currentStreak).toBe(2);

		expect(stats2.games).toBe(1);
		expect(stats2.wins).toBe(0);
		expect(stats2.currentStreak).toBe(0);
	});

	test('loss in one dataset does not affect streak in another', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		recordWin(ds1, 1);
		recordWin(ds1, 1);
		recordLoss(ds2);

		expect(getStats(ds1).currentStreak).toBe(2);
		expect(getStats(ds2).currentStreak).toBe(0);
	});
});

describe('player stats store - readablePlayerStats', () => {
	test('computes win rate correctly', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		recordWin(ds1, 3);
		recordWin(ds1, 4);
		recordLoss(ds1);
		const readable = readablePlayerStats(getStats(ds1));
		expect(readable.winRate).toBe(67); // 2/3 = 66.67 -> rounds to 67
	});

	test('computes average guesses correctly', () => {
		const { recordWin } = usePlayerStatsStore.getState();
		recordWin(ds1, 2); // 2 guesses
		recordWin(ds1, 4); // 4 guesses
		recordWin(ds1, 6); // 6 guesses
		const readable = readablePlayerStats(getStats(ds1));
		// (2+4+6)/3 = 4.0
		expect(readable.avgGuesses).toBe(4);
	});

	test('average guesses excludes losses from calculation', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();
		recordWin(ds1, 2);
		recordLoss(ds1);
		recordWin(ds1, 4);
		const readable = readablePlayerStats(getStats(ds1));
		// (2+4)/2 = 3.0
		expect(readable.avgGuesses).toBe(3);
	});

	test('returns 0 avg guesses when no wins', () => {
		usePlayerStatsStore.getState().recordLoss(ds1);
		const readable = readablePlayerStats(getStats(ds1));
		expect(readable.avgGuesses).toBe(0);
		expect(readable.winRate).toBe(0);
	});

	test('returns 0 win rate for empty stats', () => {
		const readable = readablePlayerStats(emptyStats);
		expect(readable.winRate).toBe(0);
		expect(readable.avgGuesses).toBe(0);
		expect(readable.gamesPlayed).toBe(0);
	});
});

describe('player stats store - multi-iteration simulation', () => {
	test('stats accumulate across simulated iterations (same dataset)', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();

		// Iteration 1: player wins in 3 guesses
		recordWin(ds1, 3);
		expect(getStats(ds1).games).toBe(1);
		expect(getStats(ds1).currentStreak).toBe(1);

		// Iteration 2: player loses
		recordLoss(ds1);
		expect(getStats(ds1).games).toBe(2);
		expect(getStats(ds1).currentStreak).toBe(0);
		expect(getStats(ds1).highestStreak).toBe(1);

		// Iteration 3: player wins in 1 guess
		recordWin(ds1, 1);
		expect(getStats(ds1).games).toBe(3);
		expect(getStats(ds1).currentStreak).toBe(1);

		// Iteration 4: player wins in 5 guesses
		recordWin(ds1, 5);
		expect(getStats(ds1).games).toBe(4);
		expect(getStats(ds1).currentStreak).toBe(2);
		expect(getStats(ds1).highestStreak).toBe(2);

		// Verify full distribution
		const stats = getStats(ds1);
		expect(stats.distribution[0]).toBe(1); // 1 loss
		expect(stats.distribution[1]).toBe(1); // 1 win in 1 guess
		expect(stats.distribution[3]).toBe(1); // 1 win in 3 guesses
		expect(stats.distribution[5]).toBe(1); // 1 win in 5 guesses

		const readable = readablePlayerStats(stats);
		expect(readable.gamesPlayed).toBe(4);
		expect(readable.wins).toBe(3);
		expect(readable.winRate).toBe(75);
		// (3+1+5)/3 = 3.0
		expect(readable.avgGuesses).toBe(3);
	});

	test('multi-dataset multi-iteration simulation', () => {
		const { recordWin, recordLoss } = usePlayerStatsStore.getState();

		// Dataset 1: Win, Win, Loss, Win
		recordWin(ds1, 2);
		recordWin(ds1, 4);
		recordLoss(ds1);
		recordWin(ds1, 3);

		// Dataset 2: Loss, Win, Win, Win
		recordLoss(ds2);
		recordWin(ds2, 1);
		recordWin(ds2, 1);
		recordWin(ds2, 2);

		const stats1 = getStats(ds1);
		expect(stats1.games).toBe(4);
		expect(stats1.wins).toBe(3);
		expect(stats1.currentStreak).toBe(1);
		expect(stats1.highestStreak).toBe(2);

		const stats2 = getStats(ds2);
		expect(stats2.games).toBe(4);
		expect(stats2.wins).toBe(3);
		expect(stats2.currentStreak).toBe(3);
		expect(stats2.highestStreak).toBe(3);

		// Verify distributions are separate
		expect(stats1.distribution[0]).toBe(1); // 1 loss
		expect(stats2.distribution[0]).toBe(1); // 1 loss
		expect(stats2.distribution[1]).toBe(2); // 2 wins in 1 guess
		expect(stats1.distribution[1]).toBe(0); // ds1 had no 1-guess wins (index filled with 0 when array was extended)
	});
});
