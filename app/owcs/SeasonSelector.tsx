'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Dataset, datasetInfo } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_DATASET: Dataset = 'owcs-s2';

export default function SeasonSelector() {
	const [slug, setSeason] = useSeasonParams();
	const router = useRouter();
	const formattedSlug = slug === '/' ? DEFAULT_DATASET : slug;
	const defaultValue = datasetToShorthand(formattedSlug);
	const [value, setValue] = useState(defaultValue);

	const reversedSeasons = useMemo(() => {
		return datasetInfo.toReversed();
	}, []);

	const handleThemeSwitch = useCallback(
		(newSlug: string) => {
			console.log('Redirecting in theme switcher...');
			// Ensure that the browser supports view transitions
			// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
			if ((document as any).startViewTransition && newSlug !== formattedSlug) {
				// Set the animation style to "angled"
				document.documentElement.dataset.style = 'angled';

				// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
				(document as any).startViewTransition(() => {
					setSeason(newSlug);
				});
			} else {
				setSeason(newSlug);
			}
		},
		[formattedSlug, setSeason]
	);

	const handleChange = useCallback(
		(value: string) => {
			console.log('Value: ', value);
			if (value.startsWith('owcs')) {
				router.push('/owcs');
				return;
			}
			const newDataset = datasetToShorthand(value);
			setValue(newDataset);
			handleThemeSwitch(value);
		},
		[handleThemeSwitch, router.push]
	);

	return (
		<Select defaultValue={slug} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={value}>{value}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Select season</SelectLabel>
					<Link href="/owcs" prefetch>
						<SelectItem value="owcs-s2" key="owcs-s2">
							OWCS Season 2
						</SelectItem>
					</Link>
					{reversedSeasons.slice(1).map((dataset) => (
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
