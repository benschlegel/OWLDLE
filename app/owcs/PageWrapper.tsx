'use client';
import Header from '@/app/owcs/OWCSHeader';
import UpdateMetadata from '@/app/owcs/UpdateMetadata';
import GamePage from '@/components/landing-page/game-page';
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
	// TODO: expand with new owcs seasons
	return (
		<>
			{/* <UpdateMetadata /> */}
			<MemoizedSocials />
			<MemoizedHeader />
			<GamePage slug={'owcs-s2'} />
		</>
	);
}
