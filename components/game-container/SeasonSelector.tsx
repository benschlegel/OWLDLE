'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_DATASET_NAME, OWCS_PATHNAME, OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED, datasetInfo } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { useSeasonParams } from '@/hooks/use-season-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function SeasonSelector() {
	const [slug, setSeason] = useSeasonParams();
	const router = useRouter();
	const formattedSlug = slug === '/' ? DEFAULT_DATASET_NAME : slug;
	const currentShorthand = datasetInfo.find((d) => d.dataset === formattedSlug)?.shorthand ?? '';

	const handleChange = useCallback(
		(value: string) => {
			if (value.startsWith('owcs')) {
				const owcsSeason = value.slice('owcs-'.length);
				viewTransition(() => router.push(`${OWCS_PATHNAME}?season=${owcsSeason}`));
				return;
			}
			if (value !== formattedSlug) {
				viewTransition(() => setSeason(value));
			} else {
				setSeason(value);
			}
		},
		[formattedSlug, setSeason, router]
	);

	return (
		<Select value={formattedSlug} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={currentShorthand}>
					<span className="opacity-90 font-semibold">{currentShorthand}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Champion Series</SelectLabel>
					{OWCS_DATASETS_REVERSED.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>
							{dataset.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Overwatch League</SelectLabel>
					{OWL_DATASETS_REVERSED.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>
							{dataset.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
