'use client';
import confetti from 'canvas-confetti';
import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from '@/store/settings-store';

type Props = {
	isOldState: boolean;
};

export default function GameConfetti({ isOldState }: Props) {
	const showConfetti = useSettings((s) => s.showConfetti);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const playConfetti = useCallback(() => {
		const duration = 5 * 1000;
		const end = Date.now() + duration;
		const defaults = { startVelocity: 20, spread: 450, ticks: 60 };

		intervalRef.current = setInterval(() => {
			const timeLeft = end - Date.now();
			if (timeLeft <= 0) {
				if (intervalRef.current !== null) clearInterval(intervalRef.current);
				intervalRef.current = null;
				return;
			}
			confetti({ ...defaults, particleCount: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });
		}, 250);
	}, []);

	// Fire once on mount; skip if this is a pre-existing win loaded from storage
	// biome-ignore lint/correctness/useExhaustiveDependencies: should only fire once on mount
	useEffect(() => {
		if (!isOldState && showConfetti) {
			playConfetti();
		}
		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			confetti.reset();
		};
	}, []);

	return null;
}
