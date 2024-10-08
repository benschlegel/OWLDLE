'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { datasetInfo } from '@/data/datasets';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

type Props = {
	slug: string;
};
export default function SeasonSelector({ slug }: Props) {
	const router = useRouter();
	const defaultValue = datasetToShorthand(slug);
	const [value, setValue] = useState(defaultValue);

	const reversedSeasons = useMemo(() => {
		return datasetInfo.toReversed();
	}, []);

	const handleChange = useCallback(
		(value: string) => {
			router.push(`/${value}`);
			const newDataset = datasetToShorthand(value);
			setValue(newDataset);
		},
		[router.push]
	);

	return (
		<Select defaultValue={slug} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={value}>{value}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Select season</SelectLabel>
					{reversedSeasons.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>
							{dataset.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

/**
 * Converts dataset string to shorthand (e.g. "season6" -> "S6")
 */
function datasetToShorthand(dataset: string) {
	return `${dataset.charAt(0).toUpperCase()}${dataset.slice(-1)}`;
}
