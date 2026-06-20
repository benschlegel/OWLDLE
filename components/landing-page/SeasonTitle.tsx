'use client';

import { DEFAULT_DATASET_NAME, datasetInfo } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import SeasonTitleBase from '@/components/season-selector/SeasonTitleBase';

export default function SeasonTitle() {
	const [slug] = useSeasonParams();
	const formattedSlug = slug === '/' ? DEFAULT_DATASET_NAME : slug;
	const shorthand = datasetInfo.find((d) => d.dataset === formattedSlug)?.shorthand ?? '';

	return <SeasonTitleBase shorthand={shorthand} />;
}
