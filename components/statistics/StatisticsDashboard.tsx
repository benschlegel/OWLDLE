'use client';

import { useEffect, useState } from 'react';
import { useStatisticsParams } from '@/hooks/use-statistics-params';
import { useStatistics } from '@/hooks/use-statistics';
import SeasonSelectDropdown from '@/components/season-selector/SeasonSelectDropdown';
import TimeframeSelect, { TIMEFRAME_PRESETS } from '@/components/statistics/TimeframeSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { datasetInfo } from '@/data/datasets';
import { FirstGuessChart, FirstTeamChart, GuessDistributionChart, HardestPuzzlesChart } from '@/components/statistics/StatCharts';
import { defaultGrouping, GamesPerDayChart, GROUPING_HOTKEYS, type PerDayParams, SCOPE_HOTKEYS, WinRatePerDayChart } from '@/components/statistics/PerDayChart';
import { AvgGuessesCard, GamesRadialCard } from '@/components/statistics/SummaryCharts';
import { GlobalGamesCard } from '@/components/statistics/GlobalGamesCard';
import { StatisticsInfoDialog } from '@/components/statistics/StatisticsInfoDialog';
import { useCloseChartDialog } from '@/hooks/use-chart-dialog';
import type { DayGrouping, DayScope } from '@/types/statistics';

function DashboardSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
				{(['played', 'winRate', 'avgGuesses', 'firstGuess', 'wins'] as const).map((k) => (
					<Skeleton key={k} className="h-24 rounded-lg" />
				))}
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-72 rounded-lg" />
				<Skeleton className="h-72 rounded-lg" />
			</div>
			<Skeleton className="h-60 rounded-lg" />
			<Skeleton className="h-60 rounded-lg" />
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-64 rounded-lg" />
				<Skeleton className="h-64 rounded-lg" />
			</div>
		</div>
	);
}

const BAR_CHART_PREVIEW_AMOUNT = 8;

export default function StatisticsDashboard() {
	const [params, setParams] = useStatisticsParams();

	// Dev-only toggle (never shown or applied in a production build): read the real production
	// database instead of the dev one, to verify the dashboard against real data.
	const isDev = process.env.NODE_ENV !== 'production';
	const [useProd, setUseProd] = useState(false);
	const prodOn = isDev && useProd;

	const { data, isLoading, isError, isPlaceholderData } = useStatistics({ ...params, prod: prodOn });
	const perDayParams: PerDayParams = { dataset: params.dataset, range: params.range, from: params.from, to: params.to, prod: prodOn };

	// Per-day grouping + scope are shared across every area chart (and driven by the
	// hotkeys). Grouping has an explicit override; until set it follows the timeframe length.
	const [scope, setScope] = useState<DayScope>('current');
	const [groupingOverride, setGroupingOverride] = useState<DayGrouping | null>(null);
	const grouping = groupingOverride ?? defaultGrouping(data?.timeframe.fromIso, data?.timeframe.toIso);
	const perDayControls = { grouping, setGrouping: setGroupingOverride, scope, setScope };

	const dataset = datasetInfo.find((d) => d.dataset === params.dataset);
	const shorthand = dataset?.shorthand ?? params.dataset;
	const datasetName = dataset?.formattedName ?? params.dataset;
	const presetLabel = TIMEFRAME_PRESETS.find((p) => p.value === params.range)?.label;
	const timeframeLabel = data?.timeframe.label ?? presetLabel ?? (params.from && params.to ? `${params.from} → ${params.to}` : 'Custom range');

	const closeChartDialog = useCloseChartDialog();

	// Keyboard shortcuts, scoped to this page (the dashboard only mounts on /statistics):
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.altKey && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'f') {
				e.preventDefault();
				closeChartDialog();
				return;
			}
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const target = e.target as HTMLElement | null;
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
			const key = e.key.toLowerCase();

			const preset = TIMEFRAME_PRESETS.find((p) => p.key === key);
			if (preset) {
				e.preventDefault();
				setParams({ range: preset.value, from: null, to: null });
				return;
			}
			const groupingHotkey = GROUPING_HOTKEYS.find((g) => g.key === key);
			if (groupingHotkey) {
				e.preventDefault();
				setGroupingOverride(groupingHotkey.value);
				return;
			}
			const scopeHotkey = SCOPE_HOTKEYS.find((s) => s.key === key);
			if (scopeHotkey) {
				e.preventDefault();
				setScope(scopeHotkey.value);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [setParams, closeChartDialog]);

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-owl text-primary-foreground">
						Statistics <span className="text-foreground text-2xl ml-1"> {timeframeLabel}</span>
					</h1>
					<p className="text-lg font-owl tracking-wide text-muted-foreground">{datasetName}</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					{isDev && (
						<label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
							<Switch size="sm" checked={useProd} onCheckedChange={(checked) => setUseProd(checked)} />
							Prod DB
						</label>
					)}
					<SeasonSelectDropdown value={params.dataset} currentShorthand={shorthand} onValueChange={(v) => setParams({ dataset: v as typeof params.dataset })} />
					<TimeframeSelect
						range={params.range}
						from={params.from}
						to={params.to}
						onPreset={(range) => setParams({ range, from: null, to: null })}
						onCustom={(from, to) => setParams({ range: 'custom', from, to })}
					/>
					<StatisticsInfoDialog />
				</div>
			</header>

			{/* Live, never-cached all-time count — independent of the timeframe data below. */}
			<GlobalGamesCard dataset={params.dataset} prod={prodOn} />

			{isLoading && <DashboardSkeleton />}
			{isError && !data && <p className="text-muted-foreground">Couldn't load statistics. Try again later.</p>}

			{data && !isLoading && (
				// While new data loads (dataset/timeframe switch) keep the previous charts mounted but
				// disabled + dimmed; recharts then morphs them into the new values once it arrives.
				<div className={cn('flex flex-col gap-4 transition-opacity duration-300', isPlaceholderData && 'pointer-events-none opacity-50')}>
					{data.summary.gamesPlayed === 0 ? (
						<p className="text-center text-muted-foreground py-16 font-owl text-xl">No games played in this timeframe.</p>
					) : (
						<>
							<div className="grid gap-4 sm:grid-cols-2">
								<GuessDistributionChart data={data.guessDistribution} />
								<FirstGuessChart data={data.topFirstGuesses} previewCount={BAR_CHART_PREVIEW_AMOUNT} />
							</div>

							<GamesPerDayChart params={perDayParams} {...perDayControls} />
							<WinRatePerDayChart params={perDayParams} {...perDayControls} />

							<div className="grid gap-4 sm:grid-cols-2">
								<AvgGuessesCard params={perDayParams} averageGuesses={data.summary.averageGuesses} />
								<GamesRadialCard summary={data.summary} />
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<FirstTeamChart data={data.topFirstTeams} previewCount={BAR_CHART_PREVIEW_AMOUNT} />
								<HardestPuzzlesChart data={data.hardestPuzzles} previewCount={BAR_CHART_PREVIEW_AMOUNT} />
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
