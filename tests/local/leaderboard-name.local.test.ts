import { describe, expect, test } from 'vitest';
import { leaderboardNameSchema, endlessSaveValidator } from '@/types/database';

describe('leaderboardNameSchema', () => {
	test('accepts a normal name', () => {
		const result = leaderboardNameSchema.safeParse('Tracer_99');
		expect(result.success).toBe(true);
	});

	test('accepts a name with letters, numbers, spaces, dots, and dashes', () => {
		const result = leaderboardNameSchema.safeParse('John D. 42-B');
		expect(result.success).toBe(true);
	});

	test('accepts non-Latin letters (unicode \\p{L})', () => {
		const result = leaderboardNameSchema.safeParse('Ångström');
		expect(result.success).toBe(true);
	});

	test('rejects a name with angle brackets', () => {
		const result = leaderboardNameSchema.safeParse('<b>hi</b>');
		expect(result.success).toBe(false);
	});

	test('rejects a name with a less-than character', () => {
		const result = leaderboardNameSchema.safeParse('a<b');
		expect(result.success).toBe(false);
	});

	test('rejects a 1-character name', () => {
		const result = leaderboardNameSchema.safeParse('A');
		expect(result.success).toBe(false);
	});

	test('rejects a 21-character name', () => {
		const result = leaderboardNameSchema.safeParse('A'.repeat(21));
		expect(result.success).toBe(false);
	});

	test('accepts a 2-character name', () => {
		const result = leaderboardNameSchema.safeParse('AB');
		expect(result.success).toBe(true);
	});

	test('accepts a 20-character name', () => {
		const result = leaderboardNameSchema.safeParse('A'.repeat(20));
		expect(result.success).toBe(true);
	});

	test('trims surrounding whitespace', () => {
		const result = leaderboardNameSchema.safeParse('  Hello  ');
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBe('Hello');
		}
	});

	test('trims whitespace before checking min length', () => {
		// "  A  " trims to "A" which is 1 char — should fail min(2)
		const result = leaderboardNameSchema.safeParse('  A  ');
		expect(result.success).toBe(false);
	});
});

describe('endlessSaveValidator name field uses leaderboardNameSchema', () => {
	test('accepts a valid name in save payload', () => {
		const result = endlessSaveValidator.shape.name.safeParse('Tracer_99');
		expect(result.success).toBe(true);
	});

	test('rejects angle brackets in save payload name', () => {
		const result = endlessSaveValidator.shape.name.safeParse('<script>');
		expect(result.success).toBe(false);
	});
});
