import StatsPanel from '@/components/game-container/stats-panel';
export default function RightColumn() {
	return (
		<div className="hidden xl:block absolute left-full ml-layout-spacing top-layout-top w-64">
			<StatsPanel />
		</div>
	);
}
