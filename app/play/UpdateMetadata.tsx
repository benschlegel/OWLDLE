'use client';

import { useSeasonParams } from '@/hooks/use-season-params';
import { formatDataset } from '@/lib/client';
import { useEffect } from 'react';

export default function UpdateMetadata() {
	const [season, _setSeason] = useSeasonParams();

	useEffect(() => {
		if (typeof document !== 'undefined' && season !== undefined) {
			document.title = `OWLDLE - ${formatDataset(season)}`;
		}
	}, [season]);
	return null;
}
