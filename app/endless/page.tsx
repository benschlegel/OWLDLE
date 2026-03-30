import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import EndlessPageWrapper from '@/app/endless/EndlessPageWrapper';

const description = 'Unlimited Overwatch esports pro player guessing with no daily limit. See how many you can get right in a row!';
export const metadata: Metadata = {
	...prevMetadata,
	title: `${DEFAULT_TITLE} - Endless Mode`,
	description: description,
	alternates: {
		canonical: '/endless',
	},
	openGraph: {
		title: `${DEFAULT_TITLE} - Endless Mode`,
		description: description,
		url: `${GAME_CONFIG.siteUrl}/endless`,
		images: [
			{
				alt: `${DEFAULT_TITLE} - Endless Mode`,
				url: '/open-graph/endless.png',
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
		type: 'website',
		siteName: 'owldle',
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
};

export default function EndlessPage() {
	return (
		<Suspense>
			<EndlessPageWrapper />
		</Suspense>
	);
}
