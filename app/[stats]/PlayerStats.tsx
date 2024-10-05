'use client';
import { Separator } from '@/components/ui/separator';
import { countGames } from '@/lib/databaseAccess';
import React, { useCallback, useEffect, useState } from 'react';

export default function PlayerStats() {
	const [totalGames, setTotalGames] = useState(0);

	const getTotalGames = useCallback(() => {
		fetch('/api/stats').then(async (res) => {
			const parsed = await res.json();
			setTotalGames(parsed);
			console.log('Total: ', parsed);
		});
	}, []);

	useEffect(() => {
		getTotalGames();
	}, [getTotalGames]);
	return (
		<div className="flex-col flex w-full h-full">
			<div className="px-14 py-10 flex-1">
				<div>
					<h1
						className="sm:text-4xl text-3xl font-bold sm:ml-[-1rem]"
						style={{
							fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
						}}>
						<span className="text-primary-foreground">Statistics</span>
					</h1>
				</div>
			</div>
			<Separator />
			<div className="px-10 py-4 flex justify-between items-center">
				<h1
					className="sm:text-4xl text-3xl font-bold text-center sm:ml-[-1rem]"
					style={{
						fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
					}}>
					<span className="text-primary-foreground">OWL</span>
					DLE
				</h1>
				<p className="scroll-m-20 text-lg tracking-normal opacity-80 font-mono">www.owldle.com</p>
			</div>
		</div>
	);
}
