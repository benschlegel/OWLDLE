'use client';

import { datasetInfo } from '@/data/datasets';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import SeasonTitleBase from '@/components/season-selector/SeasonTitleBase';

export default function SeasonTitle() {
	const [slug] = useOwcsParams();
	const shorthand = datasetInfo.find((d) => d.dataset === slug)?.shorthand ?? '';

	return <SeasonTitleBase shorthand={shorthand} />;
}
