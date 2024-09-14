import GameCell from '@/components/wordle/GameCell';
import type { RowData } from '@/components/wordle/GameContainer';
import type { Player } from '@/types/players';
import type { GuessResponse } from '@/types/server';

type Props = {
	data: RowData;
};

const cellSize = '3.75rem';

export default function GuessRow({ data }: Props) {
	return (
		<div className={`flex flex-row gap-2 w-full h-[3.75rem] transition-colors`}>
			{/* Player name */}
			<GameCell isLarge cellSize={cellSize} />
			{/* Country */}
			<GameCell cellSize={cellSize} />
			{/* Role */}
			<GameCell cellSize={cellSize} />
			{/* Region */}
			<GameCell cellSize={cellSize} />
			{/* Team */}
			<GameCell cellSize={cellSize} />
		</div>
	);
}
