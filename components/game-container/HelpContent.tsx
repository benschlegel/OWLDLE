'use client';
import GameCell from '@/components/game-container/GameCell';
import GuessRow from '@/components/game-container/GuessRow';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircleHelpIcon } from 'lucide-react';

type Props = {
	setIsOpen: (old: boolean) => void;
};

export default function HelpContent({ setIsOpen }: Props) {
	return (
		<DialogContent className="sm:max-w-[48rem]" onOpenAutoFocus={(e) => e.preventDefault()} aria-describedby="Tutorial on how to play the game">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					How to play
				</DialogTitle>
				<DialogDescription className="mt-2">Tutorial</DialogDescription>
			</DialogHeader>
			<p className="leading-7 opacity-80 ">
				Try to guess the correct player within 8 tries to win. Every time you make a guess, you will be given hints like the country a player is from, the
				players role, region and country.
			</p>

			<div>
				<p className="scroll-m-20 text-lg tracking-tight mb-1">This is what a row looks like after you made a guess:</p>
				<div className="flex flex-row sm:gap-2 gap-1 w-[60%] sm:h-[3.7rem] h-[3rem] transition-colors">
					<GameCell isLarge className="flex items-center justify-center text-[#fff] bg-[#ed8796]" tooltipDescription="Player name">
						<p className="text-opacity-100">Player name</p>
					</GameCell>
					<GameCell className="bg-[#f5a97f] text-[#3b3b44]  flex items-center justify-center" tooltipDescription="Country">
						<p>1</p>
					</GameCell>
					<GameCell className="bg-[#eed49f] text-[#3b3b44] flex items-center justify-center" tooltipDescription="Role">
						<p>2</p>
					</GameCell>
					<GameCell className="bg-[#a6da95] text-[#3b3b44]  flex items-center justify-center" tooltipDescription="Region">
						<p>3</p>
					</GameCell>
					<GameCell className="bg-[#8aadf4] text-[#3b3b44]  flex items-center justify-center" tooltipDescription="Team">
						<p>4</p>
					</GameCell>
				</div>
			</div>

			<DialogFooter>
				<Button type="submit" variant="outline">
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
