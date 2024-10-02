import GamePage from '@/components/landing-page/game-page';
import { type Dataset, DATASETS } from '@/data/datasets';
import { notFound } from 'next/navigation';

// Predefined valid seasons
const validSeasons = DATASETS;

interface SeasonPageProps {
	params: { dataset?: string[] };
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
