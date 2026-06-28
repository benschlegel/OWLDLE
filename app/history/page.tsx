import { DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import HistoryDashboard from '@/components/history/HistoryDashboard';

export const metadata: Metadata = {
	...prevMetadata,
	title: `${DEFAULT_TITLE} - History`,
	openGraph: {
		...prevMetadata.openGraph,
		title: `${DEFAULT_TITLE} - History`,
		url: `${GAME_CONFIG.siteUrl}/history`,
		images: [
			{ alt: `${DEFAULT_TITLE} - History`, url: '/open-graph/statistics.png', width: OgConfig.ogImageWidth, height: OgConfig.ogImageHeight, type: 'image/png' },
		],
	},
	twitter: {
		...prevMetadata.twitter,
		images: [
			{
				url: `https://www.owldle.com/open-graph/statistics.png`,
				alt: `${DEFAULT_TITLE} - History`,
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
	},
};

export default function HistoryPage() {
	return (
		<Suspense>
			<HistoryDashboard />
		</Suspense>
	);
}
