'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StageOption } from '@/types/statistics';

/** Fallback label while the stages list is still loading or empty. Mirrors the server's SINGLE_STAGE_LABEL. */
const FALLBACK_LABEL = 'Latest stage';

type Props = {
	value: string;
	stages: StageOption[];
	onValueChange: (value: string) => void;
};

/** Stage filter beside the dataset selector. Disabled (and shows the single stage's label) when the
 *  dataset has no archived stages (`stages.length <= 1`). Options come from the statistics response. */
export default function StageSelect({ value, stages, onValueChange }: Props) {
	const disabled = stages.length <= 1;
	const selected = stages.find((s) => s.value === value) ?? stages[0];
	const label = selected?.label ?? FALLBACK_LABEL;

	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger className="w-auto min-w-[7.5rem] h-9 text-sm" aria-label="Select stage">
				{/* Render the label explicitly so a value/option mismatch (e.g. value='all' while disabled) still shows text. */}
				<SelectValue placeholder={label}>{label}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{stages.map((s) => (
					<SelectItem key={s.value} value={s.value}>
						{s.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
