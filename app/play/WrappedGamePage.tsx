'use client';
import UpdateMetadata from '@/app/play/UpdateMetadata';
import GamePage from '@/components/landing-page/game-page';
import StatsPanel from '@/components/game-container/stats-panel';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { type Dataset, DATASETS } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import { notFound } from 'next/navigation';
import React from 'react';
import RightColumn from '@/components/game-container/right-column';
import LeftColumn from '@/components/game-container/left-column';

// Predefined valid seasons
const validSeasons = DATASETS;

const MemoizedHeader = React.memo(Header);
const MemoizedSocials = React.memo(Socials);

export default function SeasonPageWrapper() {
	const [season, _setSeason] = useSeasonParams();

	// Check if valid season was provided
	if (validSeasons.includes(season as unknown as Dataset)) {
		return (
			<div className="relative animate-in fade-in duration-300">
				<LeftColumn />
				<RightColumn />
				<UpdateMetadata />
				<div className="sm:hidden block">
					<MemoizedSocials />
				</div>
				<MemoizedHeader />
				<GamePage slug={season} />
			</div>
		);
	}

	// If none of the conditions match, return 404
	notFound();
}
