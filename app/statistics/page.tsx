import { DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import StatisticsDashboard from '@/components/statistics/StatisticsDashboard';

export const metadata: Metadata = {
	...prevMetadata,
	title: `${DEFAULT_TITLE} - Statistics`,
	openGraph: {
		...prevMetadata.openGraph,
		title: `${DEFAULT_TITLE} - Statistics`,
		url: `${GAME_CONFIG.siteUrl}/statistics`,
		images: [
			{
				alt: `${DEFAULT_TITLE} - Statistics`,
				url: '/open-graph/statistics.png',
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
	},
	twitter: {
		...prevMetadata.twitter,
		images: [
			{
				url: `https://www.owldle.com/open-graph/statistics.png`,
				alt: `${DEFAULT_TITLE} - Statistics`,
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
	},
};

export default function StatisticsPage() {
	return (
		<Suspense>
			<StatisticsDashboard />
		</Suspense>
	);
}
