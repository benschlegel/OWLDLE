import { Card, CardContent } from '@/components/ui/card';
import GuessRow from '@/components/game-container/GuessRow';
import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';
import type { FormattedPlayer } from '@/data/players/formattedPlayers';

type Props = {
	guesses: RowData[];
};

export type RowData = {
	player: FormattedPlayer;
	guessResult: GuessResponse;
};

export default function GameContainer({ guesses }: Props) {
	// Fill up unused guesses with undefined (e.g. if guesses contains [{player: 'super'}] and the config has '8' set as maxGuesses, the array will look like [{player: 'super'}, undefined, undefined, etc])
	const filledGuesses = guesses.concat(new Array(GAME_CONFIG.maxGuesses - guesses.length).fill(undefined));

	return (
		<Card className="transition-colors">
			<CardContent className="flex flex-col md:gap-2 gap-1 p-4 transition-colors">
				{filledGuesses.map((guess, index) => {
					return (
						<GuessRow
							data={guess}
							key={`${
								// biome-ignore lint/suspicious/noArrayIndexKey: some rows will be undefined so can't use other key
								index
							}`}
						/>
					);
				})}
			</CardContent>
		</Card>
	);
}
