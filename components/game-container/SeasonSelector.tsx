'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatasetContext } from '@/context/DatasetContext';
import { type Dataset, datasetInfo, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useState } from 'react';

type Props = {
	slug: string;
};
export default function SeasonSelector({ slug }: Props) {
	const parsedSlug = slug === '/' ? 'season1' : slug;
	const router = useRouter();
	const dataset = getDataset(parsedSlug as Dataset);
	const [_, setDataset] = useContext(DatasetContext);
	const [value, setValue] = useState(dataset?.shorthand ?? 'S1');

	const handleChange = useCallback(
		(value: string) => {
			const dataset = getDataset(value as Dataset);
			setValue(dataset?.shorthand ?? 'S1');
			setDataset(dataset ?? DEFAULT_DATASET);
			if (value === 'season1') {
				router.replace('/');
			} else {
				router.replace(`/${value}`);
			}
		},
		[router.replace, setDataset]
	);

	return (
		<Select defaultValue={dataset?.dataset} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={value}>{value}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Select season</SelectLabel>
					{datasetInfo.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>
							{dataset.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
