'use client';

import { ENDLESS_PATHNAME, datasetInfo } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { useEndlessParams } from '@/hooks/use-endless-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import SeasonSelectDropdown from '@/components/season-selector/SeasonSelectDropdown';

export default function EndlessSeasonSelector() {
	const { dataset } = useEndlessParams();
	const router = useRouter();
	const currentShorthand = datasetInfo.find((d) => d.dataset === dataset)?.shorthand ?? '';

	const handleChange = useCallback(
		(value: string) => {
			const info = datasetInfo.find((d) => d.dataset === value);
			if (!info) return;
			const mode = info.league;
			const season = mode === 'owcs' ? value.slice('owcs-'.length) : value.slice('season'.length);
			viewTransition(() => router.push(`${ENDLESS_PATHNAME}?mode=${mode}&season=${season}`));
		},
		[router]
	);

	return <SeasonSelectDropdown value={dataset} currentShorthand={currentShorthand} onValueChange={handleChange} />;
}
