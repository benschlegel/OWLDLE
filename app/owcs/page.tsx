import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SeasonPageWrapper from '@/app/owcs/PageWrapper';
import { GAME_CONFIG } from '@/lib/config';
import { datasetInfo, DEFAULT_OWCS_DATASET_NAME } from '@/data/datasets';

// 'owcs-s3' -> 's3'
const DEFAULT_OWCS_SEASON = DEFAULT_OWCS_DATASET_NAME.slice(5);

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ season?: string }> }): Promise<Metadata> {
	const { season } = await searchParams;

	// No season param => arrived via redirect from "/". Return the layout default metadata so OG image is preserved for social crawlers.
	if (!season) {
		return prevMetadata;
	}

	const seasonParam = season ?? DEFAULT_OWCS_SEASON;
	const datasetName = `owcs-${seasonParam}`;
	const info =
		datasetInfo.find((d) => d.dataset === datasetName) ??
		datasetInfo.find((d) => d.dataset === DEFAULT_OWCS_DATASET_NAME) ??
		datasetInfo[datasetInfo.length - 1];

	const formattedTitle = `${DEFAULT_TITLE} - ${info.name}`;
	const formattedDescription = `Guess the Overwatch Champions Series (${info.shorthand}) pro player from clues about their team, role and region. New puzzle every day.`;
	const ogImagePath = `/open-graph/${info.dataset}.png`;

	return {
		...prevMetadata,
		title: formattedTitle,
		description: formattedDescription,
		alternates: {
			canonical: `/${info.href}`,
		},
		icons: {
			icon: [
				{
					media: '(prefers-color-scheme: light)',
					url: '/images/icon-light.png',
					href: '/owcs_favicon.ico',
				},
				{
					media: '(prefers-color-scheme: dark)',
					url: '/images/icon.png',
					href: '/owcs_favicon.ico',
				},
			],
		},
		openGraph: {
			title: formattedTitle,
			description: formattedDescription,
			url: `${GAME_CONFIG.siteUrl}/owcs`,
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
			title: formattedTitle,
			description: DEFAULT_DESCRIPTION,
			site: `${GAME_CONFIG.siteUrl}/owcs`,
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
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-snippet': -1,
			},
		},
	};
}

export default function SeasonPage() {
	return (
		<Suspense>
			<SeasonPageWrapper />
		</Suspense>
	);
}
