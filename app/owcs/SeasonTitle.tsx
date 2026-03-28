'use client';
import { datasetInfo } from '@/data/datasets';
import { useOwcsParams } from '@/hooks/use-owcs-params';

export default function SeasonTitle() {
	const [slug] = useOwcsParams();
	const shorthand = datasetInfo.find((d) => d.dataset === slug)?.shorthand ?? '';
	const seasonNumber = shorthand.slice(1);

	return <>Season {seasonNumber}</>;
}
