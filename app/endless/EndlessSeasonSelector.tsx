'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { datasetInfo, OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { useEndlessParams } from '@/hooks/use-endless-params';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function EndlessSeasonSelector() {
	const { dataset } = useEndlessParams();
	const router = useRouter();
	const currentShorthand = datasetInfo.find((d) => d.dataset === dataset)?.shorthand ?? '';

	const handleChange = useCallback(
		(value: string) => {
			const info = datasetInfo.find((d) => d.dataset === value);
			if (!info) return;
			const mode = info.league;
			const season = mode === 'owcs' ? value.slice('owcs-'.length) : value.slice('season'.length);
			viewTransition(() => router.push(`/endless?mode=${mode}&season=${season}`));
		},
		[router]
	);

	return (
		<Select value={dataset} onValueChange={handleChange}>
			<SelectTrigger className="w-auto max-w-[7rem] px-3 pr-2 h-9 py-1 text-left text-sm leading-tight gap-1" aria-label="Select season">
				<SelectValue placeholder={currentShorthand}>
					<span className="opacity-90 font-semibold">{currentShorthand}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Champion Series</SelectLabel>
					{OWCS_DATASETS_REVERSED.map((d) => (
						<SelectItem value={d.dataset} key={d.dataset}>
							{d.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
				<SelectGroup>
					<SelectLabel className="px-2 py-1.5 text-sm font-semibold">Overwatch League</SelectLabel>
					{OWL_DATASETS_REVERSED.map((d) => (
						<SelectItem value={d.dataset} key={d.dataset}>
							{d.formattedName}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
