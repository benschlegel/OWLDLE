import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SeasonPageWrapper from '@/app/owcs/PageWrapper';
import { GAME_CONFIG } from '@/lib/config';

const formattedTitle = `${DEFAULT_TITLE} - OWCS`;
const formattedDescription = 'Guess the Overwatch Champions Series pro player from clues about their team, role and region. New puzzle every day.';
const ogImagePath = `/open-graph/opengraph-image.png?type=newImg`;

export const metadata: Metadata = {
	...prevMetadata,
	title: formattedTitle,
	alternates: {
		canonical: '/owcs',
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

export default function SeasonPage() {
	return (
		<Suspense>
			<SeasonPageWrapper />
		</Suspense>
	);
}
