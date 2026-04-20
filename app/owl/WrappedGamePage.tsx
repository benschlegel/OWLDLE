'use client';
import UpdateMetadata from '@/app/owl/UpdateMetadata';
import GamePage from '@/components/landing-page/game-page';
import GlobalStats from '@/components/game-container/global-stats';
import Header from '@/components/landing-page/header';
import { type Dataset, DATASETS } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import { notFound } from 'next/navigation';
import React from 'react';
import RightColumn from '@/components/game-container/right-column';
import LeftColumn from '@/components/game-container/left-column';
import Socials from '@/components/landing-page/socials';
import { useSettings } from '@/store/settings-store';

// Predefined valid seasons
const validSeasons = DATASETS;

const MemoizedHeader = React.memo(Header);

export default function SeasonPageWrapper() {
	const [season, _setSeason] = useSeasonParams();
	const areCreditsVisible = useSettings((s) => s.areCreditsVisible);

	// Check if valid season was provided
	if (validSeasons.includes(season as unknown as Dataset)) {
		return (
			<div className="relative animate-in fade-in duration-300">
				<LeftColumn />
				<RightColumn />
				<UpdateMetadata />
				<MemoizedHeader />
				<GamePage slug={season} />
				{areCreditsVisible && (
					<div className="-mt-1 mb-2">
						<Socials />
					</div>
				)}
			</div>
		);
	}

	// If none of the conditions match, return 404
	notFound();
}
