'use client';

import { datasetInfo } from '@/data/datasets';
import { useEndlessParams } from '@/hooks/use-endless-params';

export default function EndlessSeasonTitle() {
	const { dataset } = useEndlessParams();
	const info = datasetInfo.find((d) => d.dataset === dataset);
	return <>{info?.name ?? 'Season'}</>;
}
