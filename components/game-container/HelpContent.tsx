'use client';
import GameCell from '@/components/game-container/GameCell';
import TeamLogo from '@/components/game-container/TeamLogo';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ATLANTIC, PACIFIC } from '@/data/teams/teams';
import { CircleHelpIcon, Compass, Dices, Gamepad } from 'lucide-react';

type Props = {
	setIsOpen: (old: boolean) => void;
};

type DemoCells = {
	isLarge?: boolean;
	bgColor: string;
	color?: string;
	description: string;
	text: string;
	detailText: string;
};

const demoCells: DemoCells[] = [
	{ isLarge: true, bgColor: '#ed8796', color: '#fff', description: 'Player name', text: 'Player name', detailText: '' },
	{ bgColor: '#f5a97f', description: 'Country', text: '1', detailText: 'Nationality (represented by flag)' },
	{ bgColor: '#eed49f', description: 'Role', text: '2', detailText: 'Role (Support, Damage or Tank)' },
	{ bgColor: '#a6da95', description: 'Region', text: '3', detailText: 'Region (Atlantic or Pacific Division)' },
	{ bgColor: '#8aadf4', description: 'Team', text: '4', detailText: 'Team (represented by logo)' },
];

const defaultTextColor = "'#3b3b44'";

export default function HelpContent({ setIsOpen }: Props) {
	return (
		<DialogContent
			className="sm:max-w-[48rem] max-h-full py-6 px-3 md:px-7"
			onOpenAutoFocus={(e) => e.preventDefault()}
			aria-describedby="Tutorial on how to play the game">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center text-left">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					How to play
				</DialogTitle>
				<DialogDescription className="mt-2 text-left mb-0">Tutorial</DialogDescription>
			</DialogHeader>
			<ScrollArea type="scroll" className="h-[440px]">
				<main className="h-full flex flex-col gap-6 px-2">
					<blockquote className="leading-7 tracking-wide opacity-90 border-l-[3px] pl-4 mt-1">
						Try to guess the correct player within 8 tries to win. Every time you make a guess, you will be given hints like the country a player is from, the
						players role, region and country.
					</blockquote>
					<div>
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<Dices className="opacity-80" />
							<h2 className="">Guesses</h2>
						</div>
						<p className="scroll-m-20 text-base tracking-normal mb-3 mt-5">This is what a row looks like after you guessed a player:</p>
						<div className="flex flex-row sm:gap-2 gap-1 md:w-[60%] sm:h-[3.7rem] h-[3rem]">
							{demoCells.map((cell) => (
								<GameCell
									key={cell.text}
									isLarge={cell.isLarge}
									className={`flex items-center justify-center text-[${cell.color ?? '#3b3b44'}] bg-[${cell.bgColor}] p-2`}
									tooltipClassname={`bg-[${cell.bgColor}] text-[${cell.color ?? '#3b3b44'}]`}
									tooltipDescription={cell.description}>
									<p className="text-opacity-100 leading-4 text-sm">{cell.text}</p>
								</GameCell>
							))}
						</div>
					</div>
					<div className="grid grid-cols-2 grid-rows-2 gap-3 mt-2">
						{demoCells.slice(1).map((cell) => (
							<div key={cell.detailText} className="flex gap-4 items-center sm:col-span-1 col-span-2">
								<GameCell
									className={`bg-[${cell.bgColor}] text-[#3b3b44] !w-[2.5rem] !h-[2.5rem] sm:!w-[3rem] sm:!h-[3rem]  flex items-center justify-center`}
									tooltipClassname="!hidden"
									ignoreTabIndex
									id={`detail-${cell.text}`}>
									<p>{cell.text}</p>
								</GameCell>
								<Label htmlFor={cell.text}>{cell.detailText}</Label>
							</div>
						))}
					</div>
					<p className="scroll-m-20 text-base tracking-normal">
						A correct guess will turn the field green while a wrong one turns it red. Use this as a hint when make your next guess.
					</p>
					<div className="flex flex-col gap-5">
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<Gamepad className="opacity-80" />
							<h2 className=" ">Teams</h2>
						</div>
						<p className="scroll-m-20 text-base tracking-normal">
							Teams are divided into the{' '}
							<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
								Atlantic
							</code>{' '}
							and{' '}
							<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
								Pacific Division
							</code>
							. Season 1 had the following teams:
						</p>
						<div className="flex flex-col gap-3">
							<div className="flex flex-col w-full">
								<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
									<Compass className="opacity-80 w-5 h-5" />
									<h3 className="">Pacific Division</h3>
								</div>
								<div className="flex h-16 w-full gap-1">
									{ATLANTIC.map((team) => (
										<TeamLogo teamName={team} key={team} useTabIndex />
									))}
								</div>
							</div>
							<div className="flex flex-col w-full">
								<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
									<Compass className="opacity-80 w-5 h-5" />
									<h3 className="">Pacific Division</h3>
								</div>
								<div className="flex h-16 w-full gap-1">
									{PACIFIC.map((team) => (
										<TeamLogo teamName={team} key={team} useTabIndex />
									))}
								</div>
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>
			<DialogFooter>
				<Button type="submit" variant="outline">
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
