import Footer from '@/app/[stats]/Footer';
import SeasonStats from '@/app/[stats]/SeasonStats';
import type { StatsRes } from '@/app/[stats]/types';
import WinPercentStats from '@/app/[stats]/WinPercentStats';
import type React from 'react';
const customFontStyle: React.CSSProperties = {
	fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
};

type Props = {
	stats: StatsRes;
};
export default function GlobalStats({ stats: totalGames }: Props) {
	const avgWin = totalGames.winPercent.reduce((r, c) => r + c.winPercentage, 0) / totalGames.winPercent.length;
	return (
		<div className="flex-col flex w-full h-full">
			<div className="px-12 pt-10 flex-1 relative">
				<div>
					<h1 className="text-primary-foreground text-6xl font-bold" style={customFontStyle}>
						Statistics
					</h1>
				</div>
				{/* Sub-sections */}
				<div className="mb-8" />
				<div className="flex flex-row gap-10">
					<div className="flex flex-1 flex-col">
						<div className="w-full flex justify-center">
							<h3 className="text-3xl font-bold text-center mb-4" style={customFontStyle}>
								Games per season
							</h3>
						</div>
						<SeasonStats data={totalGames?.seasons} />
						<div className="flex gap-2 items-end mt-4">
							<h4 className="text-lg font-bold" style={customFontStyle}>
								Total games played:
							</h4>
							<h4 className="font-mono font-bold text-2xl opacity-80">{totalGames?.total.toLocaleString()}</h4>
						</div>
					</div>

					<div className="flex flex-1 flex-col">
						<div className="w-full flex justify-center">
							<h3 className="text-3xl font-bold text-center mb-4" style={customFontStyle}>
								Win percentage
							</h3>
						</div>
						<WinPercentStats data={totalGames?.winPercent} />
						<div className="flex gap-2 items-end mt-4">
							<h4 className="text-lg font-bold" style={customFontStyle}>
								Global win percentage:
							</h4>
							<h4 className="font-mono font-bold text-xl opacity-80">{avgWin.toFixed(2)}%</h4>
						</div>
					</div>
				</div>
				{/* <div className="absolute top-0 right-0 border-l-2 border-b-2 rounded-lg h-[170px] w-[500px]">Test</div> */}
			</div>
			<Footer />
		</div>
	);
}
