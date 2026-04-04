'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Dataset } from '@/data/datasets';
import { useDialogState } from '@/hooks/use-dialog-param';
import { SlidersHorizontal, Trophy, UsersIcon } from 'lucide-react';
import { Suspense, type ReactNode } from 'react';

interface EndlessGameHeaderProps {
	modeLabel: string;
	dataset: Dataset;
	seasonSelector: ReactNode;
	seasonTitle: ReactNode;
	topLabel?: ReactNode;
}

export default function EndlessGameHeader({ modeLabel, dataset, seasonSelector, seasonTitle, topLabel }: EndlessGameHeaderProps) {
	const { setOpen: setTeamsOpen } = useDialogState('teams');
	const { setOpen: setLeaderboardOpen } = useDialogState('leaderboard');
	const { setOpen: setFiltersOpen } = useDialogState('filters');

	return (
		<div className="top-0 bg-transparent sm:bg-inherit z-10 pt-4 w-full">
			{topLabel}
			<p className="sm:text-xl text-base font-bold text-center sm:ml-0 ml-[1.5rem] font-owl">
				<span className="text-primary-foreground">{modeLabel}</span>
			</p>
			<div className="flex flex-row justify-between items-center w-full">
				<div className="flex gap-2 items-center">
					<Button variant="ghost" size="icon" className="p-0" aria-label="Teams" onClick={() => setTeamsOpen(true)}>
						<UsersIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					</Button>
					{seasonSelector}
				</div>
				<div className="mb-1 flex items-center">
					<h1 className="sm:text-3xl text-2xl font-bold text-center sm:ml-[-1rem] font-owl">
						<Suspense fallback="Season 1">{seasonTitle}</Suspense>
					</h1>
				</div>
				<div className="flex gap-1">
					<Button variant="ghost" size="icon" className="p-0" aria-label="Leaderboard" onClick={() => setLeaderboardOpen(true)}>
						<Trophy className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
					</Button>
					{dataset === 'owcs-s3' && (
						<Button variant="ghost" size="icon" className="p-0" aria-label="Filters" onClick={() => setFiltersOpen(true)}>
							<SlidersHorizontal className="h-[1.2rem] w-[1.2rem]" />
						</Button>
					)}
				</div>
			</div>
			<Separator className="mb-6 mt-1 transition-colors duration-300" />
		</div>
	);
}
