'use client';

import EndlessGame from '@/components/endless/endless-game';
import EndlessSeasonSelector from '@/app/endless/EndlessSeasonSelector';
import EndlessSeasonTitle from '@/app/endless/EndlessSeasonTitle';
import GameHeader from '@/components/game-container/GameHeader';
import Socials from '@/components/landing-page/socials';
import { useEndlessParams } from '@/hooks/use-endless-params';
import { isOwcsDataset } from '@/data/datasets';
import React from 'react';
import { GamepadIcon } from 'lucide-react';

const MemoizedSocials = React.memo(Socials);

export default function EndlessPageWrapper() {
	const { dataset } = useEndlessParams();
	const modeLabel = isOwcsDataset(dataset) ? 'OWCS' : 'Overwatch League';

	return (
		<>
			<div className="sm:hidden block">
				<MemoizedSocials />
			</div>
			<GameHeader topLabel={<EndlessHeaderBadge />} modeLabel={modeLabel} seasonSelector={<EndlessSeasonSelector />} seasonTitle={<EndlessSeasonTitle />} />
			<EndlessGame dataset={dataset} />
		</>
	);
}

function EndlessHeaderBadge() {
	return (
		<div className="w-full flex items-center justify-center mb-3 -mt-2">
			<div className="flex items-center justify-center rounded-md dark:bg-primary-foreground/80 bg-primary-foreground/85 py-1 px-4 gap-2">
				<GamepadIcon className="text-white/90 size-6" />
				<span className="font-owl text-white/90 text-lg">Endless Mode</span>
			</div>
		</div>
	);
}
