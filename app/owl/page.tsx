import SeasonPageWrapper from '@/app/owl/WrappedGamePage';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import { DEFAULT_DATASET_NAME } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { formatDataset } from '@/lib/client';

const DEFAULT_SEASON_NUMBER = DEFAULT_DATASET_NAME.slice(-1);

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ season?: string }> }): Promise<Metadata> {
	const { season } = await searchParams;
	const seasonNum = season ?? DEFAULT_SEASON_NUMBER;

	// Query param only contains number, e.g. "6" -> season6
	const formattedSeason = `season${seasonNum}`;

	// Format dataset (e.g. "season1" to "Season 1")
	const formattedDataset = formatDataset(formattedSeason);
	const formattedTitle = `${DEFAULT_TITLE} - ${formattedDataset}`;
	const formattedDescription = `Guess the Overwatch League ${formattedDataset} player from clues about their team, role and nationality. New puzzle every day.`;
	const openGraphTitle = formattedSeason === DEFAULT_DATASET_NAME ? DEFAULT_TITLE : formattedTitle;

	const ogImagePath = `/open-graph/season${seasonNum}.png`;

	return {
		...prevMetadata,
		title: formattedTitle,
		description: formattedDescription,
		alternates: {
			canonical: `/owl?season=${seasonNum}`,
		},
		openGraph: {
			title: openGraphTitle,
			description: formattedDescription,
			url: GAME_CONFIG.siteUrl,
			images: [
				{
					alt: openGraphTitle,
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
			title: openGraphTitle,
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
