import { postWithRetry, postWithNetworkRetry } from '@/lib/save-with-retry';
import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';

function makeResponse(status: number): Response {
	return new Response(null, { status }) as Response;
}

describe('postWithRetry', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	test('resolves on first 200, no retry', async () => {
		const mockFetch = vi.fn().mockResolvedValue(makeResponse(200));
		vi.stubGlobal('fetch', mockFetch);

		const res = await postWithRetry('/api/test', { foo: 'bar' });
		expect(res.status).toBe(200);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	test('retries then succeeds on transient network failure', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(makeResponse(200));
		vi.stubGlobal('fetch', mockFetch);

		const promise = postWithRetry('/api/test', { foo: 'bar' }, 2);
		// Advance timers past first backoff (500ms * 1)
		await vi.advanceTimersByTimeAsync(600);
		const res = await promise;

		expect(res.status).toBe(200);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test('retries then succeeds on transient non-2xx response', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce(makeResponse(503)).mockResolvedValueOnce(makeResponse(200));
		vi.stubGlobal('fetch', mockFetch);

		const promise = postWithRetry('/api/test', { foo: 'bar' }, 2);
		await vi.advanceTimersByTimeAsync(600);
		const res = await promise;

		expect(res.status).toBe(200);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test('throws after exhausting retries on network error', async () => {
		const networkErr = new Error('Network Error');
		const mockFetch = vi.fn().mockRejectedValue(networkErr);
		vi.stubGlobal('fetch', mockFetch);

		// Attach rejection handler immediately to prevent unhandled rejection
		const promise = postWithRetry('/api/test', { foo: 'bar' }, 2).catch((e) => e);
		// Advance past both backoffs (500ms + 1000ms)
		await vi.advanceTimersByTimeAsync(2000);
		const result = await promise;

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Network Error');
		expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
	});

	test('throws after exhausting retries on non-2xx responses', async () => {
		const mockFetch = vi.fn().mockResolvedValue(makeResponse(500));
		vi.stubGlobal('fetch', mockFetch);

		const promise = postWithRetry('/api/test', { foo: 'bar' }, 2).catch((e) => e);
		await vi.advanceTimersByTimeAsync(2000);
		const result = await promise;

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('HTTP 500');
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});
});

describe('postWithNetworkRetry', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	test('resolves on first 200, no retry', async () => {
		const mockFetch = vi.fn().mockResolvedValue(makeResponse(200));
		vi.stubGlobal('fetch', mockFetch);

		const res = await postWithNetworkRetry('/api/test', { foo: 'bar' });
		expect(res.status).toBe(200);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	test('returns non-2xx response without retrying', async () => {
		const mockFetch = vi.fn().mockResolvedValue(makeResponse(500));
		vi.stubGlobal('fetch', mockFetch);

		const res = await postWithNetworkRetry('/api/test', { foo: 'bar' }, 2);
		expect(res.status).toBe(500);
		// Should NOT retry on HTTP errors, only one call
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	test('retries then succeeds on transient network failure', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(makeResponse(200));
		vi.stubGlobal('fetch', mockFetch);

		const promise = postWithNetworkRetry('/api/test', { foo: 'bar' }, 2);
		await vi.advanceTimersByTimeAsync(600);
		const res = await promise;

		expect(res.status).toBe(200);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	test('throws after exhausting retries on network error', async () => {
		const networkErr = new Error('Network Error');
		const mockFetch = vi.fn().mockRejectedValue(networkErr);
		vi.stubGlobal('fetch', mockFetch);

		const promise = postWithNetworkRetry('/api/test', { foo: 'bar' }, 2).catch((e) => e);
		await vi.advanceTimersByTimeAsync(2000);
		const result = await promise;

		expect(result).toBeInstanceOf(Error);
		expect((result as Error).message).toBe('Network Error');
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});
});
