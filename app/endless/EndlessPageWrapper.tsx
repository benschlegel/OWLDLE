'use client';

import EndlessGame from '@/components/endless/endless-game';
import EndlessSeasonSelector from '@/app/endless/EndlessSeasonSelector';
import EndlessSeasonTitle from '@/app/endless/EndlessSeasonTitle';
import GameHeader from '@/components/game-container/GameHeader';
import { useEndlessParams } from '@/hooks/use-endless-params';
import { isOwcsDataset } from '@/data/datasets';
import { GamepadIcon } from 'lucide-react';

export default function EndlessPageWrapper() {
	const { dataset } = useEndlessParams();
	const modeLabel = isOwcsDataset(dataset) ? 'OWCS' : 'Overwatch League';

	return (
		<div className="relative animate-in fade-in duration-300">
			<GameHeader topLabel={<EndlessHeaderBadge />} modeLabel={modeLabel} seasonSelector={<EndlessSeasonSelector />} seasonTitle={<EndlessSeasonTitle />} />
			<EndlessGame dataset={dataset} />
		</div>
	);
}

function EndlessHeaderBadge() {
	return (
		<div className="w-full sm:flex hidden items-center justify-center mb-3 -mt-2">
			<div className="flex items-center justify-center rounded-md dark:bg-primary-foreground/80 bg-primary-foreground/85 py-1 sm:px-4 px-3 gap-2">
				<GamepadIcon className="text-white/90 size-6" />
				<span className="font-owl text-white/90 sm:text-lg text-base">Endless Mode</span>
			</div>
		</div>
	);
}
