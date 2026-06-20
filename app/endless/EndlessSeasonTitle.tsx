'use client';

import { datasetInfo } from '@/data/datasets';
import { useEndlessParams } from '@/hooks/use-endless-params';
import SeasonTitleBase from '@/components/season-selector/SeasonTitleBase';

export default function EndlessSeasonTitle() {
	const { dataset } = useEndlessParams();
	const shorthand = datasetInfo.find((d) => d.dataset === dataset)?.shorthand ?? '';

	return <SeasonTitleBase shorthand={shorthand} />;
}
