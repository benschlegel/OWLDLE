import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '@/app/layout';
import GamePage from '@/components/landing-page/game-page';
import { type Dataset, DATASETS } from '@/data/datasets';
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

	return {
		title: `${DEFAULT_TITLE} - ${formattedDataset}`,
		description: `${DEFAULT_DESCRIPTION} (${formattedDataset})`,
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
