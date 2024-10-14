'use client';
import UpdateMetadata from '@/app/play/UpdateMetadata';
import GamePage from '@/components/landing-page/game-page';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { type Dataset, DATASETS } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import { notFound } from 'next/navigation';
import React from 'react';

// Predefined valid seasons
const validSeasons = DATASETS;

const MemoizedHeader = React.memo(Header);
const MemoizedSocials = React.memo(Socials);

export default function SeasonPageWrapper() {
	const [season, _setSeason] = useSeasonParams();

	// Check if valid season was provided
	if (validSeasons.includes(season as unknown as Dataset)) {
		return (
			<>
				<UpdateMetadata />
				<MemoizedSocials />
				<MemoizedHeader />
				<GamePage slug={season} />
			</>
		);
	}

	// If none of the conditions match, return 404
	notFound();
}
