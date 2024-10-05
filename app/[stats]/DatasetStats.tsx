import Footer from '@/app/[stats]/Footer';
import SeasonStats from '@/app/[stats]/SeasonStats';
import type { StatsRes } from '@/app/[stats]/types';
import WinnerStats from '@/app/[stats]/WinnerStats';
import type { Dataset } from '@/data/datasets';
import type React from 'react';
const customFontStyle: React.CSSProperties = {
	fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
};

type Props = {
	stats: StatsRes;
	dataset: Dataset;
};
export default function DatasetStats({ stats: totalGames, dataset }: Props) {
	const datasetPlayerStats = totalGames?.playerStats.find((p) => p.dataset === dataset);
	return (
		<div className="flex-col flex w-full h-full">
			<div className="px-12 pt-10 flex-1 relative">
				<div>
					<h1 className="text-primary-foreground text-6xl font-bold" style={customFontStyle}>
						Winners
					</h1>
				</div>
				{/* Sub-sections */}
				<div className="mb-8" />
				<div className="flex flex-row gap-10">
					<div className="flex flex-1 flex-col">
						<div className="w-full flex justify-center">
							<h3 className="text-3xl font-bold text-center mb-4 tracking-wide" style={customFontStyle}>
								Top 5 guesses ({`${dataset.slice(0, -1)} ${dataset.slice(-1)}`})
							</h3>
						</div>
						<WinnerStats data={datasetPlayerStats} maxLength={5} />
						<div className="absolute bottom-4 right-12">
							<p className="opacity-70 text-sm tracking-wide">
								<span className="text-primary-foreground">*</span>Excluding correct answer
							</p>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}
