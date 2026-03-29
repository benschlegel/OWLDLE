import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SeasonPageWrapper from '@/app/owcs/PageWrapper';
import { GAME_CONFIG } from '@/lib/config';

const formattedTitle = `${DEFAULT_TITLE} - OWCS`;
const formattedDescription = 'Guess the correct Overwatch Champion Series player within 8 tries to win.';
const ogImagePath = `/open-graph/og-image.png?img=new`;

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
		index: false,
		follow: true,
		nocache: true,
		googleBot: {
			index: true,
			follow: false,
			noimageindex: true,
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
