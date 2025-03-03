'use client';

import { useEffect } from 'react';

export default function UpdateMetadata() {
	// const [season, _setSeason] = useSeasonParams();

	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.title = `OWLDLE - OWCS Edition`;
		}
	}, []);
	return null;
}
