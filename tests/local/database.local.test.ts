import { describe, expect, test } from 'vitest';
import { getAnswer } from '@/lib/databaseAccess';

describe('basics', () => {
	test('database should be empty on init', async () => {
		const answer = await getAnswer('current', 'season1');
		expect(answer).toBe(null);
	});
	// TODO: add more tests
});
