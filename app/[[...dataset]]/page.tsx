import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, OgConfig, metadata as prevMetadata } from '@/app/layout';
import GamePage from '@/components/landing-page/game-page';
import { type Dataset, DATASETS } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { notFound } from 'next/navigation';

// Predefined valid seasons
const validSeasons = DATASETS;

interface SeasonPageProps {
	params: { dataset?: string[] };
}

export async function generateMetadata({ params }: SeasonPageProps) {
	const { dataset } = params;

	if (!dataset || !dataset[0]) {
		return {
			title: DEFAULT_TITLE,
			description: DEFAULT_DESCRIPTION,
		};
	}

	const currentDataset = dataset[0];

	// Return and use default metadata for season 1
	if (currentDataset === 'season1') return;

	// Format dataset (e.g. "season1" to "Season 1")
	const formattedDataset = `${currentDataset.charAt(0).toUpperCase() + currentDataset.slice(1, -1)} ${currentDataset.slice(-1)}`;
	const formattedTitle = `${DEFAULT_TITLE} - ${formattedDataset}`;
	const formattedDescritpion = `${DEFAULT_DESCRIPTION} (${formattedDataset})`;

	const ogImagePath = `/open-graph/${currentDataset}.png`;

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
					type: 'website',
				},
			],
			card: 'summary_large_image',
		},
	};
}

export default function SeasonPage({ params }: SeasonPageProps) {
	const { dataset } = params;
	const rootSlug = dataset ? dataset[0] : '/';

	// Check if route is root (/) or a valid season (e.g. /season1) and render game page
	// If slug length is longer than 1, this means that a sub-route exists (e.g. /season1/abc), also invalid
	if (dataset === undefined || validSeasons.includes(rootSlug as unknown as Dataset)) {
		return <GamePage slug={rootSlug} />;
	}

	// If none of the conditions match, return 404
	notFound();
}
