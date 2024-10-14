'use client';
import GamePage from '@/components/landing-page/game-page';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { type Dataset, DATASETS } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import { notFound } from 'next/navigation';
import React, { Suspense, useEffect } from 'react';

// Predefined valid seasons
const validSeasons = DATASETS;

const MemoizedHeader = React.memo(Header);
const MemoizedSocials = React.memo(Socials);

export default function SeasonPage() {
	const [season, _setSeason] = useSeasonParams();

	// Check if valid season was provided
	if (validSeasons.includes(season as unknown as Dataset)) {
		return (
			<>
				<MemoizedSocials />
				<MemoizedHeader slug={season} />
				<GamePage slug={season} />
			</>
		);
	}

	// If none of the conditions match, return 404
	notFound();
}
