import { DEFAULT_TITLE, metadata as prevMetadata } from '@/app/layout';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SeasonPageWrapper from '@/app/owcs/PageWrapper';

const DEFAULT_NAME = 'OWCS';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ season?: string }> }): Promise<Metadata> {
	const { season } = await searchParams;
	return {
		...prevMetadata,
		title: `${DEFAULT_TITLE} - OWCS`,
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
	};
}

export default function SeasonPage() {
	return (
		<Suspense>
			<SeasonPageWrapper />
		</Suspense>
	);
}
