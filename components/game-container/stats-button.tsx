'use client';

import { Button } from '@/components/ui/button';
import { useDialogState } from '@/hooks/use-dialog-param';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/store/settings-store';
import { EyeOffIcon, EyeIcon, ChartColumnIcon } from 'lucide-react';
import { useCallback } from 'react';

export default function StatsButton() {
	const { setOpen } = useDialogState('stats');
	const isMobile = useIsMobile();
	const areStatsVisible = useSettings((s) => s.areStatsVisible);
	const setAreStatsVisible = useSettings((s) => s.setAreStatsVisible);

	const toggleStatsVisible = useCallback(() => {
		setAreStatsVisible(!areStatsVisible);
	}, [setAreStatsVisible, areStatsVisible]);

	// Render dialog trigger on mobile
	if (isMobile) {
		return (
			<Button variant={'outline'} className="mt-2 gap-2" onClick={() => setOpen(true)}>
				<ChartColumnIcon className="size-4" />
				Show Stats
			</Button>
		);
	}

	if (areStatsVisible) {
		return (
			<Button variant={'outline'} className="mt-2 gap-2" onClick={toggleStatsVisible}>
				Hide Stats
				<EyeOffIcon className="size-4" />
			</Button>
		);
	}

	return (
		<Button variant={'outline'} className="mt-2 gap-2" onClick={toggleStatsVisible}>
			Show Stats
			<EyeIcon className="size-4" />
		</Button>
	);
}
