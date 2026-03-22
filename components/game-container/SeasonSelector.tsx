'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_DATASET_NAME, OWL_DATASETS, OWCS_DATASETS } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export default function SeasonSelector() {
	const [slug, setSeason] = useSeasonParams();
	const router = useRouter();
	const formattedSlug = slug === '/' ? DEFAULT_DATASET_NAME : slug;
	const defaultValue = datasetToShorthand(formattedSlug);
	const [value, setValue] = useState(defaultValue);

	const reversedOwlSeasons = useMemo(() => OWL_DATASETS.toReversed(), []);
	const reversedOwcsSeasons = useMemo(() => OWCS_DATASETS.toReversed(), []);

	const handleChange = useCallback(
		(value: string) => {
			// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
			const transition = (document as any).startViewTransition?.bind(document);
			if (value.startsWith('owcs')) {
				// Navigate to OWCS page with the selected season
				const owcsSeason = value.slice('owcs-'.length);
				setValue('CS');
				if (transition) {
					document.documentElement.dataset.style = 'angled';
					transition(() => router.push(`/owcs?season=${owcsSeason}`));
				} else {
					router.push(`/owcs?season=${owcsSeason}`);
				}
				return;
			}
			const newDataset = datasetToShorthand(value);
			setValue(newDataset);
			if (transition && value !== formattedSlug) {
				document.documentElement.dataset.style = 'angled';
				transition(() => setSeason(value));
			} else {
				setSeason(value);
			}
		},
		[formattedSlug, setSeason, router.push]
	);

	return (
		<Select defaultValue={slug} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={value}>{value}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Champion Series</SelectLabel>
					{reversedOwcsSeasons.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>{dataset.formattedName}</SelectItem>
					))}
				</SelectGroup>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Overwatch League</SelectLabel>
					{reversedOwlSeasons.map((dataset) => (
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
