import { Card, CardContent } from '@/components/ui/card';
import GuessRow from '@/components/wordle/GuessRow';
import { GAME_CONFIG } from '@/lib/config';
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
	// Fill up unused guesses with undefined (e.g. if guesses contains [{player: 'super'}] and the config has '8' set as maxGuesses, the array will look like [{player: 'super'}, undefined, undefined, etc])
	const filledGuesses = guesses.concat(new Array(GAME_CONFIG.maxGuesses - guesses.length).fill(undefined));

	return (
		<Card className="transition-colors">
			<CardContent className="flex flex-col gap-2 p-4 transition-colors">
				{filledGuesses.map((guess, index) => {
					return (
						<GuessRow
							data={guess}
							key={`${
								// biome-ignore lint/suspicious/noArrayIndexKey: needs to have undefined to fill up rows, so can't use anything but index for key
								index
							}`}
						/>
					);
				})}
			</CardContent>
		</Card>
	);
}
