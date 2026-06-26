'use client';

import { ChartColumnIcon, CookieIcon, Info, InfoIcon, KeyboardIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Marker, MarkerContent } from '@/components/ui/marker';
import { TIMEFRAME_PRESETS } from '@/components/statistics/TimeframeSelect';

const infoHotkey = 'i';

const generalHotkeys = [
	{ keys: 'hover + f', description: 'Expand chart in fullscreen mode.' },
	{ keys: 'alt + f', description: 'Close fullscreen chart (also works with text inputs).' },
];

const groupingHotkeys = [
	{ keys: 'j', description: 'Group chart data by days.' },
	{ keys: 'k', description: 'Group chart data by weeks.' },
	{ keys: 'l', description: 'Group chart data by months.' },
];
const modeHotkeys = [
	{ keys: 'o', description: 'Sum up chart data over all modes (OWL, owcs).' },
	{ keys: 'i', description: 'Only use data of the currently selected mode.' },
];

const timeframeHotkeys = TIMEFRAME_PRESETS.map((t) => ({ keys: t.key, description: t.label }));

export function StatisticsInfoDialog() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === infoHotkey) {
				e.preventDefault();
				setOpen((old) => !old);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<>
			<Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setOpen(true)} aria-label="About these statistics">
				<Info className="size-4" />
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-xl sm:max-h-160 max-h-[80%] overflow-y-scroll" aria-describedby="About these statistics">
					<DialogHeader>
						<DialogTitle className="font-owl">
							<div className="flex flex-row gap-2">
								<InfoIcon className="size-4.5 opacity-90" />
								About
							</div>
						</DialogTitle>
					</DialogHeader>
					<ul className="flex flex-col gap-3 text-base leading-7 text-muted-foreground">
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 sm:text-xl text-lg font-semibold tracking-tight">
							<CookieIcon className="opacity-90" />
							<h2 className="font-owl text-foreground">Privacy</h2>
						</div>
						<li>
							Every finished game is logged <span className="font-medium text-foreground">anonymously</span>, no accounts, names, or personal data are recorded
							or stored. The only data being stored is the results of each game, the guesses made, and when it finished.
						</li>
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 sm:text-xl text-lg font-semibold tracking-tight">
							<ChartColumnIcon className="opacity-90" />
							<h2 className="font-owl text-foreground">Stats</h2>
						</div>
						<li>Stats are aggregated per season/mode over the selected timeframe. Todays stats are excluded until the next reset to avoid spoilers.</li>
						<li>
							Data is cached and refresh about once an hour, so very recent games may not be reflected immediately (with the exception of the all time total
							game count, which updates live).
						</li>
						<li>Charts can be viewed using the expand button to see it with more space and additional info. Some charts have additional controls.</li>
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 sm:text-xl text-lg font-semibold tracking-tight">
							<KeyboardIcon className="opacity-90" />
							<h2 className="font-owl text-foreground">Hotkeys</h2>
						</div>
						<li>
							Hotkeys can be used to control data about the statistics. The following ones are available:
							<br />
							<Marker variant="separator">
								<MarkerContent>Timeframe</MarkerContent>
							</Marker>
							{timeframeHotkeys.map(({ keys, description }) => (
								<HotkeyLabels description={description} keys={keys} key={keys} />
							))}
							<Marker variant="separator">
								<MarkerContent>Modes</MarkerContent>
							</Marker>
							{modeHotkeys.map(({ keys, description }) => (
								<HotkeyLabels description={description} keys={keys} key={keys} />
							))}
							<Marker variant="separator">
								<MarkerContent>Grouping</MarkerContent>
							</Marker>
							{groupingHotkeys.map(({ keys, description }) => (
								<HotkeyLabels description={description} keys={keys} key={keys} />
							))}
							<Marker variant="separator">
								<MarkerContent>General</MarkerContent>
							</Marker>
							{generalHotkeys.map(({ keys, description }) => (
								<HotkeyLabels description={description} keys={keys} key={keys} />
							))}
						</li>
					</ul>
				</DialogContent>
			</Dialog>
		</>
	);
}

type HotkeyProps = {
	keys: string;
	description: string;
};

function HotkeyLabels({ keys, description }: HotkeyProps) {
	return (
		<div key={keys} className="flex items-center gap-6 mt-1">
			<kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 py-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
				<span className="text-xs">{keys}</span>
			</kbd>
			<p className="opacity-90 tracking-tight">{description}</p>
		</div>
	);
}
