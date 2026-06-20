'use client';

import { type Dataset, OWL_PATHNAME } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import SeasonSelectDropdown from '@/components/season-selector/SeasonSelectDropdown';

export default function SeasonSelector() {
	const [slug, setSeason] = useOwcsParams();
	const router = useRouter();

	const currentShorthand = slug.slice('owcs-'.length).toUpperCase();

	const handleChange = useCallback(
		(value: string) => {
			if (value.startsWith('owcs')) {
				// Same page, update URL param
				viewTransition(() => setSeason(value as Dataset));
			} else {
				// Navigate to OWL page
				const owlSeason = value.substring(value.length - 1);
				viewTransition(() => router.push(`${OWL_PATHNAME}?season=${owlSeason}`));
			}
		},
		[setSeason, router]
	);

	return <SeasonSelectDropdown value={slug} currentShorthand={currentShorthand} onValueChange={handleChange} />;
}
