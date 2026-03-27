'use client';
import Header from '@/app/owcs/OWCSHeader';
import GamePage from '@/components/landing-page/game-page';
import StatsPanel from '@/components/game-container/stats-panel';
import Socials from '@/components/landing-page/socials';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import React from 'react';
import LeftColumn from '@/components/game-container/left-container';
import RightColumn from '@/components/game-container/right-column';

const MemoizedHeader = React.memo(Header);
const MemoizedSocials = React.memo(Socials);

export default function SeasonPageWrapper() {
	const [slug] = useOwcsParams();
	return (
		<div className="relative animate-in fade-in duration-300">
			<LeftColumn />
			<RightColumn />
			<div className="sm:hidden block">
				<MemoizedSocials />
			</div>
			<MemoizedHeader />
			<GamePage slug={slug} />
		</div>
	);
}
