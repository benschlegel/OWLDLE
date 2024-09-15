import CountryCell from '@/components/game-container/CountryCell';
import GameCell from '@/components/game-container/GameCell';
import type { RowData } from '@/components/game-container/GameContainer';
import RoleCell from '@/components/game-container/RoleCell';
import TeamLogo from '@/components/game-container/TeamLogo';
type Props = {
	data?: RowData;
};

const cellSize = '3.75rem';
export default function GuessRow({ data }: Props) {
	return (
		<div className={`flex flex-row gap-2 w-full h-[3.7rem] transition-colors`}>
			{/* Player name */}
			<GameCell isLarge cellSize={cellSize} isCorrect={data?.guessResult.isNameCorrect} tooltipDescription="Player name">
				<div className="h-full flex justify-start px-4 items-center">
					<p className="text-xl font-extrabold tracking-tight lg:text-2xl">{data?.player.name}</p>
				</div>
			</GameCell>
			{/* Country */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isCountryCorrect} tooltipDescription="Country">
				<CountryCell imgSrc={data?.player.countryImg} />
			</GameCell>
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRoleCorrect} tooltipDescription="Role">
				<RoleCell role={data?.player.role} />
			</GameCell>
			{/* Region */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" />
			{/* Team */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team">
				<TeamLogo teamName={data?.player.team} />
			</GameCell>
		</div>
	);
}
