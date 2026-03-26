'use client';

import EndlessGame from '@/components/endless/endless-game';
import EndlessSeasonSelector from '@/app/endless/EndlessSeasonSelector';
import EndlessSeasonTitle from '@/app/endless/EndlessSeasonTitle';
import GameHeader from '@/components/game-container/GameHeader';
import Socials from '@/components/landing-page/socials';
import { useEndlessParams } from '@/hooks/use-endless-params';
import { isOwcsDataset } from '@/data/datasets';
import React from 'react';

const MemoizedSocials = React.memo(Socials);

export default function EndlessPageWrapper() {
	const { dataset } = useEndlessParams();
	const modeLabel = isOwcsDataset(dataset) ? 'OWCS' : 'Overwatch League';

	return (
		<>
			<div className="sm:hidden block">
				<MemoizedSocials />
			</div>
			<GameHeader topLabel="Endless Mode" modeLabel={modeLabel} seasonSelector={<EndlessSeasonSelector />} seasonTitle={<EndlessSeasonTitle />} />
			<EndlessGame dataset={dataset} />
		</>
	);
}
