'use client';

import { datasetInfo } from '@/data/datasets';
import { useEndlessParams } from '@/hooks/use-endless-params';

export default function EndlessSeasonTitle() {
	const { dataset } = useEndlessParams();
	const shorthand = datasetInfo.find((d) => d.dataset === dataset)?.shorthand ?? '';
	const seasonNumber = shorthand.slice(1);

	return <>Season {seasonNumber}</>;
}
