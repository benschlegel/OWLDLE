import type { RowData } from '@/components/game-container/GameContainer';
import GuessRow from '@/components/game-container/GuessRow';
import { PLAYERS_S1 } from '@/data/players/formattedPlayers';

const player = PLAYERS_S1[112];
const data: RowData = {
	player: player,
	guessResult: { isNameCorrect: false, isCountryCorrect: true, isRegionCorrect: false, isRoleCorrect: true, isTeamCorrect: false },
};

export default function HelpExample() {
	return (
		<div className="flex flex-col gap-2 mt-2">
			<p className="text-base tracking-normal">The first row could look like this after making your first guess:</p>
			<div className="w-full md:w-[60%] opacity-90">
				<GuessRow data={data} />
			</div>
			<p className="text-base tracking-normal">
				This means that the player you guessed (super) has the same role (tank) and is from the same country (US) as the correct player you're looking for. You
				can now use this information when making your next guess and slowly get closer to the answer.
			</p>
		</div>
	);
}
