import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense, type PropsWithChildren } from 'react';

interface SeasonPageProps {
	params: { dataset?: string[] };
}

export async function generateMetadata({ params }: SeasonPageProps): Promise<Metadata> {
	const { dataset } = params;

	if (!dataset || !dataset[0]) {
		return {
			title: DEFAULT_TITLE,
			description: DEFAULT_DESCRIPTION,
		};
	}

	const currentDataset = dataset[0];

	// Return and use default metadata for season 1
	if (currentDataset === 'season6') return {};

	// Format dataset (e.g. "season1" to "Season 1")
	const formattedDataset = `${currentDataset.charAt(0).toUpperCase() + currentDataset.slice(1, -1)} ${currentDataset.slice(-1)}`;
	const formattedTitle = `${DEFAULT_TITLE} - ${formattedDataset}`;
	const formattedDescritpion = DEFAULT_DESCRIPTION;

	const ogImagePath = `/open-graph/${currentDataset}.png?new=true`;

	return {
		...prevMetadata,
		title: formattedTitle,
		description: formattedDescritpion,
		openGraph: {
			title: formattedTitle,
			description: formattedDescritpion,
			url: GAME_CONFIG.siteUrl,
			images: [
				{
					alt: formattedTitle,
					url: ogImagePath,
					width: OgConfig.ogImageWidth,
					height: OgConfig.ogImageHeight,
					type: 'image/png',
				},
			],
			type: 'website',
			siteName: 'owldle',
		},
		twitter: {
			title: DEFAULT_TITLE,
			description: DEFAULT_DESCRIPTION,
			site: GAME_CONFIG.siteUrl,
			siteId: 'owldle',
			images: [
				{
					url: `https://www.owldle.com${ogImagePath}`,
					alt: formattedTitle,
					width: OgConfig.ogImageWidth,
					height: OgConfig.ogImageHeight,
					type: 'image/png',
				},
			],
			card: 'summary_large_image',
		},
	};
}

export default function DatasetLayout({ children }: PropsWithChildren) {
	return <Suspense>{children}</Suspense>;
}
