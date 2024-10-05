import PlayerStats from '@/app/[stats]/PlayerStats';

export default function Page() {
	return (
		<div className="w-full h-[100vh] bg-card">
			<div className="h-[630px] w-[1200px] bg-[#1a1a1e]">
				<PlayerStats />
			</div>
		</div>
	);
}
