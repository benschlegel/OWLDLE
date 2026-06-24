'use client';
import Header from '@/app/owcs/OWCSHeader';
import GamePage from '@/components/landing-page/game-page';
import GlobalStats from '@/components/game-container/global-stats';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import React from 'react';
import LeftColumn from '@/components/game-container/left-column';
import RightColumn from '@/components/game-container/right-column';
import Socials from '@/components/landing-page/socials';
import { useSettings } from '@/store/settings-store';

const MemoizedHeader = React.memo(Header);

export default function SeasonPageWrapper() {
	const [slug] = useOwcsParams();
	const areCreditsVisible = useSettings((s) => s.areCreditsVisible);
	return (
		<div className="relative animate-in fade-in duration-300 w-full max-w-lg mx-auto">
			<LeftColumn />
			<RightColumn />
			<MemoizedHeader />
			<GamePage slug={slug} />
			{areCreditsVisible && (
				<div className="-mt-1 mb-2">
					<Socials />
				</div>
			)}
		</div>
	);
}
