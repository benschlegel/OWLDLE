'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

const KEY_NAME = 'chart';

/** Identifies which statistics chart is expanded to fullscreen (shareable via URL). */
const charts = [
	'none',
	'guess',
	'firstGuess',
	'firstTeam',
	'gamesPerDay',
	'winRate',
	'hardest',
	'ovModes',
	'ovModeBars',
	'ovWeekday',
	'ovHour',
	'ovRoles',
	'ovPerf',
	'ovHeatmap',
] as const;
export type ChartKey = (typeof charts)[number];

/** Boolean open/close state for a chart's fullscreen dialog, backed by the `?chart=` query param. */
export function useChartDialog(key: Exclude<ChartKey, 'none'>) {
	const [active, setActive] = useQueryState(KEY_NAME, parseAsStringLiteral(charts).withDefault('none').withOptions({ history: 'push', clearOnDefault: true }));
	return {
		open: active === key,
		setOpen: (value: boolean) => setActive(value ? key : 'none'),
	} as const;
}

/** Returns a function that closes whichever chart dialog is currently open. */
export function useCloseChartDialog() {
	const [, setActive] = useQueryState(KEY_NAME, parseAsStringLiteral(charts).withDefault('none').withOptions({ history: 'push', clearOnDefault: true }));
	return () => setActive('none');
}
