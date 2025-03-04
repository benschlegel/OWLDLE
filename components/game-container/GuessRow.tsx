import ImageCell from '@/components/game-container/CountryCell';
import GameCell from '@/components/game-container/GameCell';
import type { RowData } from '@/components/game-container/GameContainer';
import RoleCell from '@/components/game-container/RoleCell';
import TeamLogo from '@/components/game-container/TeamLogo';
import { DatasetContext } from '@/context/DatasetContext';
import type { Dataset } from '@/data/datasets';
import { atlanticPacificTeams } from '@/data/teams/teams';
import { regionNames } from '@/lib/client';
import { useContext } from 'react';
type Props = {
	data?: RowData;
};

const cellSize = '3.75rem';

// How many characters until smaller font gets used
const fontBreakpoint = 7;
export default function GuessRow({ data }: Props) {
	const useSmallerFont = data && data.player.name.length > 7;
	const [dataset, _] = useContext(DatasetContext);
	let useAtlanticPacificImage = false;
	if (atlanticPacificTeams.includes(dataset.dataset)) {
		useAtlanticPacificImage = true;
	}
	console.log('Region: ', data?.player.region);

	let region = undefined;
	let regionTooltip = undefined;
	if (data) {
		if (data.player.region === 'AtlanticDivison') {
			region = 'E';
			regionTooltip = 'East';
		} else if (data.player.region === 'PacificDivision') {
			region = 'W';
			regionTooltip = 'West';
		} else if (data.player.region === 'EMEA') {
			region = 'EMEA';
			regionTooltip = 'EMEA';
		} else if (data.player.region === 'NA') {
			region = 'NA';
			regionTooltip = 'North America';
		} else if (data.player.region === 'Korea') {
			region = 'KR';
			regionTooltip = 'Korea';
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
			{dataset.dataset !== 'owcs-s2' ? (
				<GameCell isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" tooltipValue={regionTooltip}>
					{useAtlanticPacificImage ? (
						<ImageCell imgSrc={data?.player.regionImg} />
					) : (
						<p className="text-3xl sm:text-4xl font-bold tracking-tight text-white opacity-90">{region}</p>
					)}
				</GameCell>
			) : (
				<GameCell isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" tooltipValue={regionTooltip}>
					{region === 'EMEA' ? (
						<p className="text-sm sm:text-xl font-bold sm:tracking-tighter text-white opacity-90">{region}</p>
					) : (
						<p className="text-xl sm:text-2xl font-bold tracking-tight text-white opacity-90">{region}</p>
					)}
				</GameCell>
			)}
			{/* Team */}
			<GameCell isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team" tooltipValue={data?.player.team}>
				<TeamLogo teamName={data?.player.team} />
			</GameCell>
		</div>
	);
}
