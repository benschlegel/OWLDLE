'use client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Dataset, OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { useOwcsParams } from '@/hooks/use-owcs-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function SeasonSelector() {
	const [slug, setSeason] = useOwcsParams();
	const router = useRouter();

	const currentShorthand = slug.slice('owcs-'.length).toUpperCase();

	const handleChange = useCallback(
		(value: string) => {
			// biome-ignore lint/suspicious/noExplicitAny: startViewTransition doesnt have full browser sup yet
			const transition = (document as any).startViewTransition?.bind(document);
			if (value.startsWith('owcs')) {
				// Same page — update URL param
				if (transition) {
					document.documentElement.dataset.style = 'angled';
					transition(() => setSeason(value as Dataset));
				} else {
					setSeason(value as Dataset);
				}
			} else {
				// Navigate to OWL page
				const owlSeason = value.substring(value.length - 1);
				if (transition) {
					document.documentElement.dataset.style = 'angled';
					transition(() => router.push(`/play?season=${owlSeason}`));
				} else {
					router.push(`/play?season=${owlSeason}`);
				}
			}
		},
		[setSeason, router]
	);

	return (
		<Select value={slug} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={currentShorthand}>{currentShorthand}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Champion Series</SelectLabel>
					{OWCS_DATASETS_REVERSED.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>{dataset.formattedName}</SelectItem>
					))}
				</SelectGroup>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Overwatch League</SelectLabel>
					{OWL_DATASETS_REVERSED.map((dataset) => (
						<SelectItem value={dataset.dataset} key={dataset.dataset}>{dataset.formattedName}</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
