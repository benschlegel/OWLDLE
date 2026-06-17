/**
 * postWithRetry, POST JSON to a URL, retrying on network errors AND non-2xx responses.
 *
 * Use for endpoints that are idempotent (e.g. /api/save-endless which deduplicates by clientId).
 * For non-idempotent endpoints, use postWithNetworkRetry instead.
 */
export async function postWithRetry(url: string, body: unknown, retries = 2): Promise<Response> {
	let lastErr: unknown;
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (res.ok) return res;
			lastErr = new Error(`HTTP ${res.status}`);
		} catch (e) {
			lastErr = e;
		}
		if (attempt < retries) await new Promise<void>((r) => setTimeout(r, 500 * (attempt + 1)));
	}
	throw lastErr;
}

/**
 * postWithNetworkRetry, POST JSON to a URL, retrying ONLY on network errors (rejected fetch).
 *
 * Use for non-idempotent endpoints (e.g. /api/save which inserts a row per call).
 * Non-2xx HTTP responses are returned as-is without retrying.
 */
export async function postWithNetworkRetry(url: string, body: unknown, retries = 2): Promise<Response> {
	let lastErr: unknown;
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			// Return all HTTP responses (including non-2xx) without retrying
			return res;
		} catch (e) {
			lastErr = e;
		}
		if (attempt < retries) await new Promise<void>((r) => setTimeout(r, 500 * (attempt + 1)));
	}
	throw lastErr;
}
