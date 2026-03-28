'use client';
import confetti from 'canvas-confetti';
import { useCallback, useEffect } from 'react';

type Props = {
	isOldState: boolean;
};

export default function GameConfetti({ isOldState }: Props) {
	const playConfetti = useCallback(() => {
		const duration = 5 * 1000;
		const end = Date.now() + duration;
		const defaults = { startVelocity: 20, spread: 450, ticks: 60 };

		const interval = setInterval(() => {
			const timeLeft = end - Date.now();
			if (timeLeft <= 0) {
				clearInterval(interval);
				return;
			}
			confetti({ ...defaults, particleCount: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });
		}, 250);
	}, []);

	// Fire once on mount; skip if this is a pre-existing win loaded from storage
	// biome-ignore lint/correctness/useExhaustiveDependencies: should only fire once on mount
	useEffect(() => {
		if (!isOldState) {
			playConfetti();
		}
	}, []);

	return null;
}
