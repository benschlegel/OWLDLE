import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, metadata as prevMetadata } from '@/app/layout';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import EndlessPageWrapper from '@/app/endless/EndlessPageWrapper';

export const metadata: Metadata = {
	...prevMetadata,
	title: `${DEFAULT_TITLE} - Endless Mode`,
	description: `${DEFAULT_DESCRIPTION} - Endless Mode`,
	alternates: {
		canonical: '/endless',
	},
	openGraph: {
		title: `${DEFAULT_TITLE} - Endless Mode`,
		description: `${DEFAULT_DESCRIPTION} - Endless Mode`,
		url: `${GAME_CONFIG.siteUrl}/endless`,
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
