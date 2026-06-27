import { DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import GlobalInsightsDashboard from '@/components/statistics/GlobalInsightsDashboard';

export const metadata: Metadata = {
	...prevMetadata,
	openGraph: {
		...prevMetadata.openGraph,
		title: `${DEFAULT_TITLE} - Global Insights`,
		url: `${GAME_CONFIG.siteUrl}/statistics/global`,
		images: [
			{
				alt: `${DEFAULT_TITLE} - Global Insights`,
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
				alt: `${DEFAULT_TITLE} - Global Insights`,
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
	},
};

export default function GlobalInsightsPage() {
	return (
		<Suspense>
			<GlobalInsightsDashboard />
		</Suspense>
	);
}
