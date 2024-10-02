'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Dataset, FORMATTED_DATASETS } from '@/data/datasets';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type Props = {
	slug: string;
};
export default function SeasonSelector({ slug }: Props) {
	const parsedSlug = slug === '/' ? 'season1' : slug;
	const router = useRouter();
	const dataset = FORMATTED_DATASETS.find((dataset) => dataset.dataset === parsedSlug);
	const [value, setValue] = useState(dataset?.dataset ?? 'Season 1');

	const handleChange = useCallback(
		(value: string) => {
			setValue(value as Dataset);
			if (value === 'season1') {
				router.replace('/');
			} else {
				router.replace(`/${value}`);
			}
		},
		[router.replace]
	);

	return (
		<Select defaultValue={value} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] pl-3 h-9 py-1 text-left text-sm leading-tight">
				<SelectValue placeholder="Season 1" defaultValue={'Test'} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Select season</SelectLabel>
					{FORMATTED_DATASETS.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>
							{dataset.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
