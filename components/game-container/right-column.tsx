import StatsPanel from '@/components/game-container/stats-panel';
export default function RightColumn() {
	return (
		<div className="hidden xl:block absolute left-full top-0 ml-4 w-64">
			<StatsPanel />
		</div>
	);
}
