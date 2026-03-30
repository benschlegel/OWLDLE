import { DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	...prevMetadata,
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
		<div className="w-full sm:mt-80 mt-65 flex items-center justify-center">
			<div className="flex flex-col items-center justify-center gap-3">
				<h1 className="sm:text-7xl text-5xl font-owl text-primary-foreground opacity-95 text-center">Coming soon</h1>
				<span className="text-foreground text-lg text-center opacity-70 leading-tight">
					Global statistics for each season will be here, coming soon. Check back later!
				</span>
			</div>
		</div>
	);
}
