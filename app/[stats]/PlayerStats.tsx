'use client';
import GlobalStatsScreen from '@/app/[stats]/GlobalStats';
import type { StatsRes } from '@/app/[stats]/types';
import type { Dataset } from '@/data/datasets';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

export default function GameStats() {
	const [totalGames, setTotalGames] = useState<StatsRes>();
	const getTotalGames = useCallback(() => {
		fetch('/api/stats').then(async (res) => {
			const parsed = (await res.json()) as StatsRes;

			// Format datasets
			parsed.seasons.map((d) => {
				d.dataset = `${d.dataset.charAt(0).toUpperCase()}${d.dataset.slice(1, -1)} ${d.dataset.slice(-1)}` as Dataset;
				return d;
			});
			parsed.winPercent.map((d) => {
				d.dataset = `${d.dataset.charAt(0).toUpperCase()}${d.dataset.slice(1, -1)} ${d.dataset.slice(-1)}` as Dataset;
				return d;
			});
			parsed.playerStats.map((d) => {
				d.dataset = `${d.dataset.charAt(0).toUpperCase()}${d.dataset.slice(1, -1)} ${d.dataset.slice(-1)}` as Dataset;
				return d;
			});
			setTotalGames(parsed);
			// console.log('Total: ', parsed);
		});
	}, []);

	useEffect(() => {
		getTotalGames();
	}, [getTotalGames]);

	if (!totalGames) return <></>;

	return <GlobalStatsScreen stats={totalGames} />;
}
