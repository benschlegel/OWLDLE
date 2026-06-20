'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';

type Props = {
	value: string;
	currentShorthand: string;
	onValueChange: (value: string) => void;
};

export default function SeasonSelectDropdown({ value, currentShorthand, onValueChange }: Props) {
	return (
		<Select value={value} onValueChange={onValueChange}>
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
