'use client';
import Footer from '@/app/[stats]/Footer';
import type { StatsRes } from '@/app/[stats]/types';
import React, { useCallback, useEffect, useState } from 'react';

export default function GameStats() {
	const [totalGames, setTotalGames] = useState<StatsRes>();

	const getTotalGames = useCallback(() => {
		fetch('/api/stats').then(async (res) => {
			const parsed = (await res.json()) as StatsRes;
			setTotalGames(parsed);
			console.log('Total: ', parsed);
		});
	}, []);

	useEffect(() => {
		getTotalGames();
	}, [getTotalGames]);
	return (
		<div className="flex-col flex w-full h-full">
			<div className="px-14 py-10 flex-1 relative">
				<div>
					<h1
						className="sm:text-4xl text-3xl font-bold sm:ml-[-1rem]"
						style={{
							fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
						}}>
						<span className="text-primary-foreground text-6xl">Statistics</span>
					</h1>
				</div>
				{/* <div className="absolute top-0 right-0 border-l-2 border-b-2 rounded-lg h-[170px] w-[500px]">Test</div> */}
				<div>
					<p>Test</p>
				</div>
			</div>
			<Footer />
		</div>
	);
}
