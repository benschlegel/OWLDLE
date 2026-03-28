import { Card, CardContent } from '@/components/ui/card';
import GuessRow from '@/components/game-container/GuessRow';
import { GAME_CONFIG } from '@/lib/config';
import type { GuessResponse } from '@/types/server';
import type { CombinedFormattedPlayer, FormattedPlayer } from '@/data/players/formattedPlayers';

type Props = {
	guesses: RowData[];
	isDismissing?: boolean;
};

export type RowData = {
	player: CombinedFormattedPlayer;
	guessResult: GuessResponse;
};

/** Delay between each row's dismiss animation (bottom-to-top stagger) */
export const ROW_DISMISS_STAGGER = 0.08;

/** Duration of the flip-out tween animation (ms) */
export const FLIP_OUT_DURATION = 400;

export default function GameContainer({ guesses, isDismissing }: Props) {
	// Fill up unused guesses with undefined (e.g. if guesses contains [{player: 'super'}] and the config has '8' set as maxGuesses, the array will look like [{player: 'super'}, undefined, undefined, etc])
	const filledGuesses = guesses.concat(new Array(GAME_CONFIG.maxGuesses - guesses.length).fill(undefined));

	return (
		<Card className="transition-colors">
			<CardContent className="flex flex-col sm:gap-2 gap-1 sm:p-4 p-2 transition-colors">
				{filledGuesses.map((guess, index) => {
					// Bottom-to-top: bottom data row (index guesses.length-1) starts first (delay 0),
					// top data row (index 0) starts last
					const dismissDelay = guess ? (guesses.length - 1 - index) * ROW_DISMISS_STAGGER : 0;
					return (
						<GuessRow
							data={guess}
							isDismissing={isDismissing}
							dismissDelay={dismissDelay}
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
