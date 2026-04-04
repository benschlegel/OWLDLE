'use client';

import { lazy, Suspense } from 'react';
import { Dialog } from '@/components/ui/dialog';

const LazyLeaderboardNameContent = lazy(() => import('./leaderboard-name-content'));

type Props = {
	open: boolean;
	streakLength: number;
	onSubmitWithName: (name: string) => void;
	onSubmitAnonymous: () => void;
};

export default function LeaderboardNameDialog({ open, streakLength, onSubmitWithName, onSubmitAnonymous }: Props) {
	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onSubmitAnonymous(); }}>
			<Suspense>
				<LazyLeaderboardNameContent
					open={open}
					streakLength={streakLength}
					onSubmitWithName={onSubmitWithName}
					onSubmitAnonymous={onSubmitAnonymous}
				/>
			</Suspense>
		</Dialog>
	);
}
