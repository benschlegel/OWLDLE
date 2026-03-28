'use client';
import Header from '@/app/owcs/OWCSHeader';
import GamePage from '@/components/landing-page/game-page';
import GlobalStats from '@/components/game-container/global-stats';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import React from 'react';
import LeftColumn from '@/components/game-container/left-column';
import RightColumn from '@/components/game-container/right-column';

const MemoizedHeader = React.memo(Header);

export default function SeasonPageWrapper() {
	const [slug] = useOwcsParams();
	return (
		<div className="relative animate-in fade-in duration-300">
			<LeftColumn />
			<RightColumn />
			<MemoizedHeader />
			<GamePage slug={slug} />
		</div>
	);
}
