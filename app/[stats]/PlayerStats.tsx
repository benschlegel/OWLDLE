'use client';
import Footer from '@/app/[stats]/Footer';
import type { StatsRes } from '@/app/[stats]/types';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

const customFontStyle: React.CSSProperties = {
	fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
};

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
			<div className="px-12 py-10 flex-1 relative">
				<div>
					<h1 className="text-primary-foreground text-6xl font-bold" style={customFontStyle}>
						Statistics
					</h1>
				</div>
				{/* Sub-sections */}
				<div className="mt-10" />
				<div className="flex flex-row">
					<div className="flex flex-1">
						<div className="w-full flex justify-center">
							<h3 className="text-3xl font-bold text-center" style={customFontStyle}>
								Games per season
							</h3>
						</div>
					</div>
					<div className="flex flex-1">
						<div className="w-full flex justify-center">
							<h3 className="text-3xl font-bold text-center" style={customFontStyle}>
								Win percentage
							</h3>
						</div>
					</div>
				</div>
				{/* <div className="absolute top-0 right-0 border-l-2 border-b-2 rounded-lg h-[170px] w-[500px]">Test</div> */}
			</div>
			<Footer />
		</div>
	);
}
