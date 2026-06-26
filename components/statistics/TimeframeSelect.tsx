'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimeframeRange } from '@/types/statistics';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

/** Preset timeframes in display order, each with its keyboard shortcut (active on /statistics). */
export const TIMEFRAME_PRESETS: { value: TimeframeRange; label: string; key: string }[] = [
	{ value: 'yesterday', label: 'Yesterday', key: 'w' },
	{ value: 'last7', label: 'Last 7 days', key: 'd' },
	{ value: 'last30', label: 'Last 30 days', key: 's' },
	{ value: 'last90', label: 'Last 90 days', key: 'x' },
	{ value: 'lastYear', label: 'Last year', key: 'c' },
	{ value: 'all', label: 'All time', key: 'a' },
];

/** Local YYYY-MM-DD in UTC to match the server's date parsing. */
function toYmd(d: Date): string {
	return d.toISOString().slice(0, 10);
}

type Props = {
	range: TimeframeRange;
	from: string | null;
	to: string | null;
	onPreset: (range: TimeframeRange) => void; // sets range, clears from/to
	onCustom: (from: string, to: string) => void; // sets range='custom' + dates
};

export default function TimeframeSelect({ range, from, to, onPreset, onCustom }: Props) {
	const [open, setOpen] = useState(false);
	// disable today and later (yesterday is the latest selectable day)
	const today = new Date();
	const disabledAfter = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1));
	const selected: DateRange | undefined = range === 'custom' && from && to ? { from: new Date(from), to: new Date(to) } : undefined;

	return (
		<div className="flex items-center gap-2">
			<Select value={range === 'custom' ? '' : range} onValueChange={(v) => onPreset(v as TimeframeRange)}>
				<SelectTrigger className="w-auto min-w-[8.5rem] h-9 text-sm" aria-label="Select timeframe">
					{/* Render the label explicitly so the per-item kbd chip never leaks into the trigger. */}
					<SelectValue placeholder={range === 'custom' ? 'Custom range' : 'Timeframe'}>
						{range === 'custom' ? 'Custom range' : TIMEFRAME_PRESETS.find((p) => p.value === range)?.label}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{TIMEFRAME_PRESETS.map((p) => (
						<SelectItem key={p.value} value={p.value}>
							<span className="flex items-center gap-3">
								<span className="min-w-26">{p.label}</span>
								<kbd className="hidden h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 text-[0.65rem] font-medium uppercase text-muted-foreground sm:inline-flex">
									{p.key}
								</kbd>
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" size="sm" className="h-9 gap-2" aria-label="Pick a custom date range">
						<CalendarIcon className="size-4" />
						<span className="hidden sm:inline">{range === 'custom' && from && to ? `${from} → ${to}` : 'Custom'}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						mode="range"
						selected={selected}
						disabled={{ after: disabledAfter }}
						onSelect={(r?: DateRange) => {
							if (r?.from && r?.to) {
								onCustom(toYmd(r.from), toYmd(r.to));
								setOpen(false);
							}
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
