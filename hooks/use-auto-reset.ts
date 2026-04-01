import { FLIP_OUT_DURATION, ROW_DISMISS_STAGGER } from '@/components/game-container/GameContainer';
import type { RowData } from '@/components/game-container/GameContainer';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Milliseconds to wait after nextReset before triggering the reset.
 */
const GRACE_PERIOD_MS = 7_000;

/**
 * Schedules an automatic reset when nextReset passes while the page is open.
 * Plays the same dismiss (flip-out) animation used by the endless game before
 * performing the actual reset.
 *
 * The timer is set to nextReset + GRACE_PERIOD_MS so that new server data is
 * available when the query is refetched after the reset.
 */
export function useAutoReset({
	nextReset,
	evaluatedGuesses,
	performReset,
}: {
	nextReset: Date | string | undefined;
	evaluatedGuesses: RowData[];
	performReset: () => void;
}) {
	const [isDismissing, setIsDismissing] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	// Refs keep the timer callback stable so rescheduling only happens when nextReset itself changes, not on every guess.
	const evaluatedGuessesLengthRef = useRef(evaluatedGuesses.length);
	evaluatedGuessesLengthRef.current = evaluatedGuesses.length;

	const prefersReducedMotionRef = useRef(prefersReducedMotion);
	prefersReducedMotionRef.current = prefersReducedMotion;

	const performResetRef = useRef(performReset);
	performResetRef.current = performReset;

	const triggerReset = useCallback(() => {
		if (prefersReducedMotionRef.current || evaluatedGuessesLengthRef.current === 0) {
			performResetRef.current();
			return;
		}
		setIsDismissing(true);
		const duration = (evaluatedGuessesLengthRef.current - 1) * ROW_DISMISS_STAGGER * 1000 + FLIP_OUT_DURATION;
		setTimeout(() => {
			setIsDismissing(false);
			performResetRef.current();
		}, duration);
	}, []); // intentionally stable, reads live values via refs

	useEffect(() => {
		if (!nextReset) return;
		const delay = new Date(nextReset).getTime() + GRACE_PERIOD_MS - Date.now();
		// already past, synchronous reset on load handles this
		if (delay <= 0) return;

		const timerId = setTimeout(triggerReset, delay);
		return () => clearTimeout(timerId);
	}, [nextReset, triggerReset]);

	return isDismissing;
}
