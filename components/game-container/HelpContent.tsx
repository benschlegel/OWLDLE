'use client';
import HelpExample from '@/components/game-container/HelpExample';
import TeamLogo from '@/components/game-container/TeamLogo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import CustomCell from '@/components/ui/CustomCell';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DatasetContext } from '@/context/DatasetContext';
import { getAtlantic, getPacific } from '@/data/teams/teams';
import type { ValidateResponse } from '@/types/server';
import { CircleHelpIcon, Dices, Gamepad, LightbulbIcon } from 'lucide-react';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';

type Props = {
	setIsOpen: (old: boolean) => void;
};

export type DemoCell = {
	isLarge?: boolean;
	bgColor: string;
	color?: string;
	description: string;
	text: string;
	detailText: string;
};

const demoCells: DemoCell[] = [
	{ isLarge: true, bgColor: '#ed8796', color: '#fff', description: 'Player name', text: 'Player name', detailText: '' },
	{ bgColor: '#f5a97f', color: '#3b3b44', description: 'Country', text: '1', detailText: 'Nationality (represented by flag)' },
	{ bgColor: '#eed49f', color: '#3b3b44', description: 'Role', text: '2', detailText: 'Role (Support, Damage or Tank)' },
	{ bgColor: '#a6da95', color: '#3b3b44', description: 'Region', text: '3', detailText: 'Region (Atlantic or Pacific Division)' },
	{ bgColor: '#8aadf4', color: '#3b3b44', description: 'Team', text: '4', detailText: 'Team (represented by logo)' },
];

function countdownRenderer({ days, hours, minutes, seconds, milliseconds, completed }: CountdownRenderProps) {
	if (completed) {
		// Render a completed state
		return <></>;
	}
	// Render a countdown
	return (
		<p className="gap-2 font-mono font-bold">
			<span>{zeroPad(hours)}</span>:<span>{zeroPad(minutes)}</span>:<span>{zeroPad(seconds)}</span>
		</p>
	);
}

export default function HelpContent({ setIsOpen }: Props) {
	const [nextReset, setNextReset] = useState<Date>();
	const [dataset, _] = useContext(DatasetContext);
	const [mounted, setMounted] = useState(false);

	const atlanticTeams = getAtlantic(dataset.dataset);
	const pacificTeams = getPacific(dataset.dataset);

	useEffect(() => {
		async function fetchReset() {
			const res = await fetch('/api/validate');
			const data = (await res.json()) as ValidateResponse;
			setNextReset(new Date(data.nextReset));
		}
		fetchReset().then(() => setMounted(true));
	}, []);
	return (
		<DialogContent
			className="sm:max-w-[48rem] max-h-full py-6 px-3 md:px-7"
			// onOpenAutoFocus={(e) => e.preventDefault()}
			aria-describedby="Tutorial on how to play the game">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center text-left">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					How to play
				</DialogTitle>
				<DialogDescription className="mt-2 text-left mb-0">Tutorial</DialogDescription>
			</DialogHeader>
			<ScrollArea type="scroll" className="h-[440px]">
				<main className="h-full w-full flex flex-col gap-6 px-2 pb-2 text-wrap break-words ">
					{/* Description section */}
					<blockquote className="leading-7 tracking-wide opacity-90 border-l-[3px] pl-4 mt-1">
						Guess the correct Overwatch League player within 8 attempts to win. After each guess, you will receive hints based on attributes like the player's
						role, team, region and nationality to help you get closer to the right answer.
					</blockquote>
					<div>
						{/* Guesses section */}
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<Dices className="opacity-80" />
							<h2 className="">Guesses</h2>
						</div>
						<p className="scroll-m-20 text-base tracking-normal mb-3 mt-5">This is what a row looks like after you made a guess:</p>
						<div className="flex flex-row sm:gap-2 gap-1 w-full md:w-[60%]">
							{demoCells.map((cell) => (
								<CustomCell cellData={cell} key={cell.text} />
							))}
						</div>
					</div>
					<div className="grid grid-cols-2 grid-rows-2 gap-3 mt-2">
						{demoCells.slice(1).map((cell) => (
							<div key={cell.text} className="flex gap-4 items-center sm:col-span-1 col-span-2">
								<CustomCell id={`detail-${cell.text}`} cellData={cell} ignoreTabIndex isSmall />
								<Label htmlFor={`detail-${cell.text}`}>{cell.detailText}</Label>
							</div>
						))}
						{/* {demoCells.slice(1).map((cell) => (
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
						))} */}
					</div>

					<Accordion type="single" collapsible className="px-2">
						<AccordionItem value="item-1">
							<AccordionTrigger>Full example</AccordionTrigger>
							<AccordionContent>
								<HelpExample />
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					<p className="scroll-m-20 text-base tracking-normal">
						A correct guess will mark the field as green while a wrong one marks it red. Use this information when making your next guess.
					</p>
					<div className="flex flex-col gap-5">
						{/* Teams section */}
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
							. {dataset.name} had the following teams:
						</p>
						<div className="flex flex-col gap-3">
							<div className="flex flex-col">
								<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
									{/* <Compass className="opacity-80 w-5 h-5" /> */}
									<h3 className="">Atlantic Division</h3>
								</div>
								<div className="flex w-full gap-0 sm:gap-1 flex-wrap">
									{atlanticTeams?.map((team) => (
										<div className="w-14 sm:w-[4.5rem] h-14 sm:h-[4.5rem]" key={team}>
											<TeamLogo teamName={team} useTabIndex className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]" />
										</div>
									))}
								</div>
							</div>
							<div className="flex flex-col w-full">
								<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
									{/* <Compass className="opacity-80 w-5 h-5" /> */}
									<h3 className="">Pacific Division</h3>
								</div>
								<div className="flex w-full gap-0 sm:gap-1 flex-wrap">
									{pacificTeams?.map((team) => (
										<div className="w-14 sm:w-[4.5rem] h-14 sm:h-[4.5rem]" key={team}>
											<TeamLogo teamName={team} useTabIndex className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]" />
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					{/* Tips section */}
					<div>
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<LightbulbIcon className="opacity-80" />
							<h2 className="">Tips</h2>
						</div>
						<div className="flex flex-col gap-2">
							<p className="scroll-m-20 text-base tracking-normal mt-4">
								Most elements on this website have tooltips, so when you need more info, try hovering it. The website also has some hotkeys:
							</p>
							<div className="flex items-center gap-6 mt-1">
								<kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 py-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
									<span className="text-xs">ctrl + y</span>
								</kbd>
								<p className="opacity-90 tracking-tight">Jump to search input</p>
							</div>
							<div className="flex items-center gap-6">
								<kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 py-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
									<span className="text-xs">ctrl + k</span>
								</kbd>
								<p className="opacity-90 tracking-tight">Open search in popup dialog</p>
							</div>
						</div>
						<div className="flex flex-col gap-2 mt-4">
							<p className="scroll-m-20 text-base tracking-normal">The correct answer for this game resets every day.</p>
							<div className="w-full gap-2 flex flex-row">
								<p className="scroll-m-20 text-base tracking-tight">Start of next game:</p>
								{mounted ? (
									<Countdown key="countdown" date={nextReset ?? new Date()} renderer={countdownRenderer} autoStart />
								) : (
									<p className="text-muted-foreground">loading...</p>
								)}
							</div>
						</div>
						<Separator className="my-4" />
						<div>
							<p className="scroll-m-20 text-base tracking-normal">
								If you like this project, you can{' '}
								<Link
									href={'https://ko-fi.com/scorer5'}
									className="underline-offset-4 underline decoration-primary-foreground hover:decoration-primary-foreground/80 text-base tracking-normal"
									prefetch={false}>
									buy me a coffee
								</Link>{' '}
								or check out the source code for this project on{' '}
								<Link
									href={'https://github.com/benschlegel/OWLDLE'}
									className="underline-offset-4 underline decoration-primary-foreground hover:decoration-primary-foreground/80 text-base tracking-normal"
									prefetch={false}>
									Github
								</Link>
								.
							</p>
						</div>
					</div>
				</main>
			</ScrollArea>
			<DialogFooter>
				<Button type="submit" variant="outline" autoFocus onClick={() => setIsOpen(false)}>
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

// TODO: add example (accordion)
