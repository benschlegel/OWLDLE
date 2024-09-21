import CountryCell from '@/components/game-container/CountryCell';
import GameCell from '@/components/game-container/GameCell';
import type { RowData } from '@/components/game-container/GameContainer';
import RoleCell from '@/components/game-container/RoleCell';
import TeamLogo from '@/components/game-container/TeamLogo';
import { regionNames } from '@/lib/client';
type Props = {
	data?: RowData;
};

const cellSize = '3.75rem';

// How many characters until smaller font gets used
const fontBreakpoint = 7;
export default function GuessRow({ data }: Props) {
	let regionAbbreviation: string | undefined = undefined;

	if (data?.player.region === 'AtlanticDivison') regionAbbreviation = 'E';
	if (data?.player.region === 'PacificDivision') regionAbbreviation = 'W';

	const useSmallerFont = data && data.player.name.length > 7;
	return (
		<div className={`flex flex-row sm:gap-2 gap-1 w-full sm:h-[3.7rem] h-[3rem] transition-colors`}>
			{/* Player name */}
			<GameCell isLarge cellSize={cellSize} isCorrect={data?.guessResult.isNameCorrect} tooltipDescription="Player name" tooltipValue={data?.player.name}>
				<div className="rounded-md h-full flex justify-center sm:px-4 px-2 items-center">
					<p className={`text-white opacity-90 font-extrabold text-center tracking-tight ${useSmallerFont ? 'text-sm' : 'text-xl'} md:text-2xl`}>
						{data?.player.name}
					</p>
				</div>
			</GameCell>
			{/* Country */}
			<GameCell
				cellSize={cellSize}
				isCorrect={data?.guessResult.isCountryCorrect}
				tooltipDescription="Country"
				tooltipValue={data ? regionNames.of(data?.player.country) : undefined}>
				<CountryCell imgSrc={data?.player.countryImg} />
			</GameCell>
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRoleCorrect} tooltipDescription="Role" tooltipValue={data?.player.role}>
				<RoleCell role={data?.player.role} />
			</GameCell>
			{/* Region */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" tooltipValue={data?.player.region}>
				<div className="h-full w-full flex justify-center px-4 items-center">
					<p className="text-white opacity-90 font-extrabold tracking-tight text-3xl lg:text-4xl">{regionAbbreviation}</p>
				</div>
			</GameCell>
			{/* Team */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team" tooltipValue={data?.player.team}>
				<TeamLogo teamName={data?.player.team} />
			</GameCell>
		</div>
	);
}
