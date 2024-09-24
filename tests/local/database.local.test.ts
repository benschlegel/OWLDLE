import { afterAll, beforeAll, describe, expect, test, vitest } from 'vitest';
import { getAnswer } from '@/lib/databaseAccess';

describe('basics', () => {
	test('database should be empty on init', async () => {
		const answer = await getAnswer('current', 'OWL_season1');
		expect(answer).toBe(null);
	});
});
