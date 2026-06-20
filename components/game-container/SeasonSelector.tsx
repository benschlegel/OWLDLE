'use client';

import { DEFAULT_DATASET_NAME, OWCS_PATHNAME, datasetInfo } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { useSeasonParams } from '@/hooks/use-season-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import SeasonSelectDropdown from '@/components/season-selector/SeasonSelectDropdown';

export default function SeasonSelector() {
	const [slug, setSeason] = useSeasonParams();
	const router = useRouter();
	const formattedSlug = slug === '/' ? DEFAULT_DATASET_NAME : slug;
	const currentShorthand = datasetInfo.find((d) => d.dataset === formattedSlug)?.shorthand ?? '';

	const handleChange = useCallback(
		(value: string) => {
			if (value.startsWith('owcs')) {
				const owcsSeason = value.slice('owcs-'.length);
				viewTransition(() => router.push(`${OWCS_PATHNAME}?season=${owcsSeason}`));
				return;
			}
			if (value !== formattedSlug) {
				viewTransition(() => setSeason(value));
			} else {
				setSeason(value);
			}
		},
		[formattedSlug, setSeason, router]
	);

	return <SeasonSelectDropdown value={formattedSlug} currentShorthand={currentShorthand} onValueChange={handleChange} />;
}
