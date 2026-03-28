import GlobalStats from '@/components/game-container/global-stats';
export default function RightColumn() {
	return (
		<div className="hidden xl:block absolute left-full ml-layout-spacing top-layout-top w-layout-width">
			<GlobalStats />
		</div>
	);
}
