import GameHeader from '@/components/game-container/GameHeader';
import SeasonSelector from '@/components/game-container/SeasonSelector';
import SeasonTitle from '@/components/landing-page/SeasonTitle';

export default function Header() {
	return <GameHeader modeLabel="Overwatch League" seasonSelector={<SeasonSelector />} seasonTitle={<SeasonTitle />} />;
}
