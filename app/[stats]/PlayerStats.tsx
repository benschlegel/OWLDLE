'use client';
import DatasetStats from '@/app/[stats]/DatasetStats';
import GlobalStatsScreen from '@/app/[stats]/GlobalStats';
import type { StatsRes } from '@/app/[stats]/types';
import type { Dataset } from '@/data/datasets';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

// * Configure here:
// Shows global stats if true, details stats for specific season otherwise
const SHOW_GLOBAL_STATS = false;
// If SHOW_GLOBAL_STATS is false, this decides what season the report will be generated for
const DETAIL_DATASET: Dataset = 'season3';

// Anonymous data
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
			setTotalGames(parsed);
			// console.log('Total: ', parsed);
		});
	}, []);

	useEffect(() => {
		getTotalGames();
	}, [getTotalGames]);

	if (!totalGames) return <></>;

	return SHOW_GLOBAL_STATS ? <GlobalStatsScreen stats={totalGames} /> : <DatasetStats stats={totalGames} dataset={DETAIL_DATASET} />;
}
