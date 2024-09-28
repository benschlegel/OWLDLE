import GamePage from '@/components/landing-page/game-page';
import { notFound } from 'next/navigation';

// Predefined valid seasons
const validSeasons = ['season1', 'season2'];

interface SeasonPageProps {
	params: { dataset?: string[] };
}

export default function SeasonPage({ params }: SeasonPageProps) {
	const { dataset: season } = params;
	const rootSlug = season ? season[0] : '/';

	// Check if route is root (/) or a valid season (e.g. /season1) and render game page
	// If slug length is longer than 1, this means that a sub-route exists (e.g. /season1/abc), also invalid
	if (season === undefined || validSeasons.includes(rootSlug)) {
		console.log('Route: ', season);
		return <GamePage slug={rootSlug} />;
	}

	// If none of the conditions match, return 404
	notFound();
}
