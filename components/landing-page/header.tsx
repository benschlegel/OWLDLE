'use client';

import { ModeToggle } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import GameContainer, { type RowData } from '@/components/wordle/GameContainer';
import TeamLogo from '@/components/wordle/TeamLogo';
import { PLAYERS } from '@/data/players/formattedPlayers';
import { formatResult } from '@/lib/client';
import type { Player } from '@/types/players';
import type { GuessResponse } from '@/types/server';
import { CircleHelpIcon, InfoIcon } from 'lucide-react';
import { useEffect } from 'react';

const guesses: RowData[] = [
	{
		player: { name: 'JJoNak', country: 'KR', role: 'Support', team: 'NewYorkExcelsior', isEastern: true },
		guessResult: { isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: true, isRoleCorrect: false, isTeamCorrect: false },
	},
];

export default function Header() {
	useEffect(() => {
		console.log('Players: ', PLAYERS);
		const guesses: GuessResponse[] = [{ isCountryCorrect: true, isNameCorrect: false, isRegionCorrect: false, isRoleCorrect: false, isTeamCorrect: false }];
		// const formattedResult = formatResult({ guesses: guesses, gameIteration: 1, });
		// console.log('Result: ', formattedResult);
	}, []);

	return (
		<>
			<div className="flex flex-row justify-between items-center w-full">
				<Button variant="ghost" size="icon" className="p-0">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
				</Button>
				<div className="mb-3">
					<h1 className="text-4xl font-bold text-center">
						<span className="text-primary-foreground">OWL</span>
						<span className="text-primary-foreground/70">S1</span>LE
					</h1>
				</div>
				<ModeToggle />
			</div>
			<Separator className="mb-6 mt-1" />
			<GameContainer guesses={guesses} />
		</>
	);
}
