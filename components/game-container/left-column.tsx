import PersonalStats from '@/components/game-container/personal-stats';

export default function LeftColumn() {
	return (
		<div className="hidden xl:block absolute right-full top-layout-top mr-layout-spacing w-64">
			<PersonalStats />
		</div>
	);
}
