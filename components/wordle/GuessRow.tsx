import GameCell from '@/components/wordle/GameCell';
import type { RowData } from '@/components/wordle/GameContainer';
import TeamLogo from '@/components/wordle/TeamLogo';
type Props = {
	data?: RowData;
};

const cellSize = '3.75rem';
export default function GuessRow({ data }: Props) {
	return (
		<div className={`flex flex-row gap-2 w-full h-[3.7rem] transition-colors`}>
			{/* Player name */}
			<GameCell isLarge cellSize={cellSize} isCorrect={data?.guessResult.isNameCorrect} tooltipDescription="Player name" />
			{/* Country */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isCountryCorrect} tooltipDescription="Country" />
			{/* Role */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRoleCorrect} tooltipDescription="Role" />
			{/* Region */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" />
			{/* Team */}
			<GameCell cellSize={cellSize} isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team">
				<TeamLogo teamName={data?.player.team} />
			</GameCell>
		</div>
	);
}
