'use client';
import Header from '@/app/owcs/OWCSHeader';
import GamePage from '@/components/landing-page/game-page';
import Socials from '@/components/landing-page/socials';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import React from 'react';

const MemoizedHeader = React.memo(Header);
const MemoizedSocials = React.memo(Socials);

export default function SeasonPageWrapper() {
	const [slug] = useOwcsParams();
	return (
		<div className="animate-in fade-in duration-300">
			<div className="sm:hidden block">
				<MemoizedSocials />
			</div>
			<MemoizedHeader />
			<GamePage slug={slug} />
		</div>
	);
}
