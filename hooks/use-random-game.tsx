'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryRandomGame } from '@/types/history';
import { usePlausible } from 'next-plausible';

/** `mode` is 'all' (sample across every dataset) or a specific dataset key. */
async function fetchRandom(mode: string): Promise<HistoryRandomGame | null> {
	try {
		const url = mode === 'all' ? '/api/history/random' : `/api/history/random?dataset=${encodeURIComponent(mode)}`;
		const res = await fetch(url, { cache: 'no-store' });
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

/**
 * Random games sampled across all datasets (or a chosen one). The next game is always pre-loaded so
 * each reroll swaps with no latency; the displayed game only updates on `reroll()`. Changing `mode`
 * re-queues the pre-loaded (next/first) game so the next reroll respects the new selection.
 */
export function useRandomGame(mode: string) {
	const [current, setCurrent] = useState<HistoryRandomGame | null>(null);
	const nextRef = useRef<Promise<HistoryRandomGame | null> | null>(null);
	const modeRef = useRef(mode);
	const mountedRef = useRef(true);
	const plausible = usePlausible();

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	// (Re)queue the pre-loaded game whenever the mode changes (including initial mount).
	useEffect(() => {
		modeRef.current = mode;
		nextRef.current = fetchRandom(mode);
	}, [mode]);

	const reroll = useCallback(() => {
		const m = modeRef.current;
		const pending = nextRef.current ?? fetchRandom(m);
		nextRef.current = fetchRandom(m); // queue the one after
		pending.then((game) => {
			if (game && mountedRef.current) {
				plausible('rerollHistory');
				setCurrent(game);
			}
		});
	}, [plausible]);

	return { current, reroll };
}
