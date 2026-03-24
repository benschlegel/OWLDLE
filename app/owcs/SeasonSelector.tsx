'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Dataset, OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function SeasonSelector() {
	const [slug, setSeason] = useOwcsParams();
	const router = useRouter();

	const currentShorthand = slug.slice('owcs-'.length).toUpperCase();

	const handleChange = useCallback(
		(value: string) => {
			if (value.startsWith('owcs')) {
				// Same page — update URL param
				viewTransition(() => setSeason(value as Dataset));
			} else {
				// Navigate to OWL page
				const owlSeason = value.substring(value.length - 1);
				viewTransition(() => router.push(`/play?season=${owlSeason}`));
			}
		},
		[setSeason, router]
	);

	return (
		<Select value={slug} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={currentShorthand} className="">
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
