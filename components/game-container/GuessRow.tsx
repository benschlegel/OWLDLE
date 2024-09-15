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
	let regionAbbreviation: string | undefined = undefined;

	if (data?.player.isEastern === true) regionAbbreviation = 'E';
	if (data?.player.isEastern === false) regionAbbreviation = 'W';
	return (
		<div className={`flex flex-row gap-2 w-full h-[3.7rem] transition-colors`}>
			{/* Player name */}
			<GameCell isLarge cellSize={cellSize} isCorrect={data?.guessResult.isNameCorrect} tooltipDescription="Player name">
				<div className="h-full flex justify-start px-4 items-center">
					<p className="text-white opacity-90 text-xl font-extrabold tracking-tight lg:text-2xl">{data?.player.name}</p>
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
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region">
				<div className="h-full w-full flex justify-center px-4 items-center">
					<p className="text-white opacity-90 font-extrabold tracking-tight text-3xl lg:text-4xl">{regionAbbreviation}</p>
				</div>
			</GameCell>
			{/* Team */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team">
				<TeamLogo teamName={data?.player.team} />
			</GameCell>
		</div>
	);
}
