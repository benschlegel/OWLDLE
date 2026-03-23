import GameHeader from '@/components/game-container/GameHeader';
import SeasonSelector from '@/app/owcs/SeasonSelector';
import SeasonTitle from '@/app/owcs/SeasonTitle';

export default function Header() {
	return (
		<GameHeader
			leagueLabel="OWCS"
			seasonSelector={<SeasonSelector />}
			seasonTitle={<SeasonTitle />}
		/>
	);
}
