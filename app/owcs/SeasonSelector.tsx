'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { type Dataset, datasetInfo } from '@/data/datasets';
import { useSeasonParams } from '@/hooks/use-season-params';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_DATASET: Dataset = 'owcs-s2';

export default function SeasonSelector() {
	const [slug, setSeason] = useSeasonParams();
	const router = useRouter();
	const formattedSlug = slug === '/' ? 'OWCS' : slug;
	// const defaultValue = datasetToShorthand(formattedSlug);
	const [value, setValue] = useState('CS');

	const reversedSeasons = useMemo(() => {
		return datasetInfo.toReversed();
	}, []);

	const handleThemeSwitch = useCallback(
		(newSlug: string) => {
			console.log('Redirecting in theme switcher...');
			// Ensure that the browser supports view transitions
			// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
			if ((document as any).startViewTransition) {
				// Set the animation style to "angled"
				document.documentElement.dataset.style = 'angled';

				// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
				(document as any).startViewTransition(() => {
					router.push(`/play?season=${newSlug.substring(newSlug.length - 1)}`);
					// setSeason(newSlug);
				});
			} else {
				router.push(`/play?season=${newSlug.substring(newSlug.length - 1)}`);
				// setSeason(newSlug);
			}
		},
		[router.push]
	);

	const handleChange = useCallback(
		(value: string) => {
			console.log('Value (owcs): ', value);
			if (value.startsWith('owcs')) {
				// Link is redirect, dont handle values
				return;
			}
			// const newDataset = datasetToShorthand(value);
			// setValue(value);

			handleThemeSwitch(value);
		},
		[handleThemeSwitch]
	);

	return (
		<Select defaultValue={'owcs-s2'} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={value}>{value}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{/* <SelectLabel className="px-2 py-1.5 text-sm font-semibold">Select season</SelectLabel>
					<Separator /> */}
					<SelectGroup>
						<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Champion Series</SelectLabel>

						<Link href="/owcs" prefetch>
							<SelectItem value="owcs-s2" key="owcs-s2">
								OWCS Season 2
							</SelectItem>
						</Link>
					</SelectGroup>
					<SelectGroup>
						<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Overwatch League</SelectLabel>
						{reversedSeasons.slice(1).map((dataset) => (
							<Link href="/play" key={`season-select-${dataset.dataset}`} prefetch>
								<SelectItem value={dataset.dataset} key={dataset.dataset}>
									{dataset.formattedName}
								</SelectItem>
							</Link>
						))}
					</SelectGroup>
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
