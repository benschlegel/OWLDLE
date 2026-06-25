'use client';

import { useStatisticsParams } from '@/hooks/use-statistics-params';
import { useStatistics } from '@/hooks/use-statistics';
import SeasonSelectDropdown from '@/components/season-selector/SeasonSelectDropdown';
import TimeframeSelect from '@/components/statistics/TimeframeSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { datasetInfo } from '@/data/datasets';
import {
	FirstGuessChart,
	FirstTeamChart,
	GamesPerDayChart,
	GuessDistributionChart,
	HardestPuzzlesChart,
	SummaryCards,
	WinRatePerDayChart,
} from '@/components/statistics/StatCharts';
import { GlobalGamesCard } from '@/components/statistics/GlobalGamesCard';
import { injectDevMock, USE_DEV_MOCK } from '@/components/statistics/dev-mock';

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

export default function StatisticsDashboard() {
	const [params, setParams] = useStatisticsParams();
	const { data: rawData, isLoading, isError } = useStatistics(params);
	const data = USE_DEV_MOCK && rawData ? injectDevMock(rawData) : rawData;
	const shorthand = datasetInfo.find((d) => d.dataset === params.dataset)?.shorthand ?? params.dataset;

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 flex flex-col gap-4">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-3xl font-owl text-primary-foreground">Statistics</h1>
				<div className="flex items-center gap-2 flex-wrap">
					<SeasonSelectDropdown value={params.dataset} currentShorthand={shorthand} onValueChange={(v) => setParams({ dataset: v as typeof params.dataset })} />
					<TimeframeSelect
						range={params.range}
						from={params.from}
						to={params.to}
						onPreset={(range) => setParams({ range, from: null, to: null })}
						onCustom={(from, to) => setParams({ range: 'custom', from, to })}
					/>
				</div>
			</header>

			{isLoading ? (
				<Skeleton className="h-5 w-28 -mt-2" />
			) : data?.timeframe.label ? (
				<p className="text-sm text-muted-foreground -mt-2">{data.timeframe.label}</p>
			) : null}

			{/* Live, never-cached all-time count — independent of the timeframe data below. */}
			<GlobalGamesCard />

			{isLoading && <DashboardSkeleton />}
			{isError && <p className="text-muted-foreground">Couldn't load statistics. Try again later.</p>}

			{data && !isLoading && (
				<>
					{data.summary.gamesPlayed === 0 ? (
						<p className="text-center text-muted-foreground py-16 font-owl text-xl">No games played in this timeframe.</p>
					) : (
						<>
							<SummaryCards summary={data.summary} />

							<div className="grid gap-4 sm:grid-cols-2">
								<GuessDistributionChart data={data.guessDistribution} />
								<FirstGuessChart data={data.topFirstGuesses} previewCount={data.guessDistribution.length} />
							</div>

							<GamesPerDayChart data={data.gamesPerDay} />
							<WinRatePerDayChart data={data.gamesPerDay} />

							<div className="grid gap-4 sm:grid-cols-2">
								<FirstTeamChart data={data.topFirstTeams} previewCount={data.guessDistribution.length} />
								<HardestPuzzlesChart data={data.hardestPuzzles} previewCount={data.guessDistribution.length} />
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
}
