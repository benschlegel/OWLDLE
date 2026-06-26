'use client';

import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalGames } from '@/hooks/use-global-games';

/** Classic count-up ticker: tweens from its current value to the new one whenever
 *  `value` changes (and counts up from 0 on first mount). */
function AnimatedCount({ value }: { value: number }) {
	const count = useMotionValue(0);
	const text = useTransform(count, (v) => Math.round(v).toLocaleString());

	useEffect(() => {
		const controls = animate(count, value, { duration: 1, ease: 'easeOut' });
		return () => controls.stop();
	}, [value, count]);

	return <motion.span>{text}</motion.span>;
}

/** Timeframe-independent: total games ever logged across every dataset/mode.
 *  Fetches its own always-fresh count and animates the number on change. */
export function GlobalGamesCard({ prod = false }: { prod?: boolean }) {
	const { data, isError } = useGlobalGames(prod);

	return (
		<Card className="overflow-hidden border-primary-foreground/30 bg-primary-foreground/3">
			<CardContent className="p-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
				<div className="flex flex-col">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Total Daily Games Played</p>
					{data == null ? (
						isError ? (
							<p className="text-4xl font-owl text-primary-foreground">—</p>
						) : (
							<Skeleton className="h-10 w-40" />
						)
					) : (
						<p className="text-4xl font-owl text-primary-foreground tabular-nums">
							<AnimatedCount value={data} />
						</p>
					)}
				</div>
				<p className="text-sm text-muted-foreground sm:text-right">All-time, across every season &amp; mode</p>
			</CardContent>
		</Card>
	);
}
