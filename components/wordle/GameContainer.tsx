import { Card, CardContent } from '@/components/ui/card';
import GuessRow from '@/components/wordle/GuessRow';
import type { Player } from '@/types/players';
import type { GuessResponse } from '@/types/server';

type Props = {
	guesses: RowData[];
};

export type RowData = {
	player: Player;
	guessResult: GuessResponse;
};

export default function GameContainer({ guesses }: Props) {
	return (
		<Card className="transition-colors">
			<CardContent className="flex gap-2 p-4 transition-colors">
				{guesses.map((guess, index) => {
					return <GuessRow data={guess} key={`${index}-${guess.player.name}`} />;
				})}
			</CardContent>
		</Card>
	);
}
