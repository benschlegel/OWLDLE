import ImageCell from '@/components/game-container/CountryCell';
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
	const useSmallerFont = data && data.player.name.length > 7;

	let region = undefined;
	let regionTooltip = undefined;
	if (data) {
		if (data.player.region === 'AtlanticDivison') {
			region = 'E';
			regionTooltip = 'East';
		} else if (data.player.region === 'PacificDivision') {
			region = 'W';
			regionTooltip = 'West';
		}
	}
	return (
		<div className={`flex flex-row sm:gap-2 gap-1 w-full sm:h-[3.7rem] h-[3rem] transition-colors`}>
			{/* Player name */}
			<GameCell isLarge isCorrect={data?.guessResult.isNameCorrect} tooltipDescription="Player name" tooltipValue={data?.player.name}>
				<div className="rounded-md h-full flex justify-center sm:px-4 px-2 items-center">
					<p className={`text-white opacity-90 font-extrabold text-center tracking-tight ${useSmallerFont ? 'text-sm' : 'text-xl'} md:text-2xl`}>
						{data?.player.name}
					</p>
				</div>
			</GameCell>
			{/* Country */}
			<GameCell
				isCorrect={data?.guessResult.isCountryCorrect}
				tooltipDescription="Country"
				tooltipValue={data ? regionNames.of(data?.player.country) : undefined}>
				<ImageCell imgSrc={data?.player.countryImg} />
			</GameCell>
			{/* Role */}
			<GameCell isCorrect={data?.guessResult.isRoleCorrect} tooltipDescription="Role" tooltipValue={data?.player.role}>
				<RoleCell role={data?.player.role} />
			</GameCell>
			{/* Region */}
			<GameCell isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" tooltipValue={regionTooltip}>
				{/* <ImageCell imgSrc={data?.player.regionImg} /> */}

				<p className="text-3xl sm:text-4xl font-bold tracking-tight text-white opacity-90">{region}</p>
			</GameCell>
			{/* Team */}
			<GameCell isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team" tooltipValue={data?.player.team}>
				<TeamLogo teamName={data?.player.team} />
			</GameCell>
		</div>
	);
}
