'use client';
import HelpExample from '@/components/game-container/dialogs/HelpExample';
import TeamLogo from '@/components/game-container/TeamLogo';
import LinkButton from '@/components/LinkButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import CustomCell from '@/components/ui/CustomCell';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatasetContext } from '@/context/DatasetContext';
import { type CombinedDatasetMetadata, Dataset } from '@/data/datasets';
import { atlanticPacificTeams, getAtlantic, getEmea, getKr, getNa, getPacific } from '@/data/teams/teams';
import { useAnswerQuery } from '@/hooks/use-answer-query';
import { DEFAULT_DIALOG_VALUE, useDialogParams, type DialogKey } from '@/hooks/use-dialog-param';
import { CircleHelpIcon, Clapperboard, Dices, Gamepad, LightbulbIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Options } from 'nuqs';
import React from 'react';
import { useContext, useCallback } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';

type Props = {
	setOpen: (value: boolean) => void;
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
		return <p>Soon</p>;
		// return <></>;
	}
	// Render a countdown
	return (
		<p className="gap-2 font-mono font-bold">
			<span>{zeroPad(hours)}</span>:<span>{zeroPad(minutes)}</span>:<span>{zeroPad(seconds)}</span>
		</p>
	);
}

// Memoized Button component to prevent unnecessary re-renders
const MemoizedButton = React.memo(({ onClick }: { onClick: () => void }) => (
	<Button type="submit" variant="outline" autoFocus onClick={onClick}>
		Close
	</Button>
));

export default function HelpContent({ setOpen }: Props) {
	const [dataset, _] = useContext(DatasetContext);
	const { data: validatedData, isSuccess } = useAnswerQuery(dataset.dataset);
	// console.log('Data: ', validatedData);
	// if (validatedData) {
	// 	console.log('Next reset: ', new Date(validatedData?.nextReset));
	// }
	const [_dialog, setDialog] = useDialogParams();

	// Memoize the setDialog function to prevent unnecessary re-renders
	const handleClose = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

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
					{dataset.dataset !== 'owcs-s2' ? <OWLHeaderText /> : <OWCSHeaderText />}
					<div className="flex flex-col gap-5">
						{/* Teams section */}
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<Gamepad className="opacity-80" />
							<h2 className=" ">Teams</h2>
						</div>
						{dataset.dataset !== 'owcs-s2' ? <OWLTeams dataset={dataset} /> : <OWCSTeams dataset={dataset} />}
						<blockquote className="leading-7 tracking-wide opacity-90 border-primary-foreground border-l-[3px] pl-4 mt-1">
							Check back here when switching to a different season to see updated teams. You can switch seasons using the dropdown next to the help icon.
						</blockquote>
					</div>
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
					</div>

					<Accordion type="single" collapsible>
						<AccordionItem value="item-1">
							<AccordionTrigger className="focus-visible:outline-none rounded focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 px-2">
								Full example
							</AccordionTrigger>
							<AccordionContent>
								<HelpExample />
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					<p className="scroll-m-20 text-base tracking-normal">
						A correct guess will mark the field as green while a wrong one marks it red. Use this information when making your next guess.
					</p>
					{/* Tips section */}
					<div>
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<LightbulbIcon className="opacity-80" />
							<h2 className="">Tips</h2>
						</div>
						<div className="flex flex-col gap-2">
							<p className="scroll-m-20 text-base tracking-normal mt-4">
								Most elements on this website have tooltips, so when you need more info, try hovering it (or pressing on mobile). The website also has some
								hotkeys:
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
							<div className="flex items-center gap-6">
								<kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 py-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
									<span className="text-xs">ctrl + e</span>
								</kbd>
								<p className="opacity-90 tracking-tight">Open/close help dialog</p>
							</div>
						</div>
						<div className="flex flex-col gap-2 mt-4">
							<p className="scroll-m-20 text-base tracking-normal">The correct answer for this game resets every day.</p>
							<div className="w-full gap-2 flex flex-row">
								<p className="scroll-m-20 text-base tracking-tight">Start of next game:</p>
								{isSuccess && validatedData ? (
									<Countdown key="countdown" date={validatedData.nextReset} renderer={countdownRenderer} autoStart />
								) : (
									<p className="text-muted-foreground">loading...</p>
								)}
							</div>
						</div>
					</div>
					<div>
						<div className="flex gap-2 items-center first:mt-0 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
							<Clapperboard className="opacity-80" />
							<h2 className="">Credits</h2>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-base tracking-normal mt-4">
								All player data was sourced through <LinkButton href={'https://liquipedia.net/overwatch/Overwatch_League'}>Liquipedia</LinkButton>. Not
								affiliated with Blizzard Entertainment.
							</p>
							<div>
								<p className="scroll-m-20 text-base leading-7">
									If you like this project, you can{' '}
									<LinkButton type="button" href="" onClick={() => setDialog('feedback')}>
										send feedback/suggestions
									</LinkButton>
									, <LinkButton href={'https://ko-fi.com/scorer5'}>buy me a coffee</LinkButton> or check out the source code for this project on{' '}
									<LinkButton href={'https://github.com/benschlegel/OWLDLE'}>Github</LinkButton>.
								</p>
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>
			<DialogFooter>
				<MemoizedButton onClick={handleClose} />
			</DialogFooter>
		</DialogContent>
	);
}

function OWLTeams({ dataset }: { dataset: CombinedDatasetMetadata }) {
	const atlanticTeams = getAtlantic(dataset.dataset);
	const pacificTeams = getPacific(dataset.dataset);

	const atlanticText = atlanticPacificTeams.includes(dataset.dataset) ? 'Atlantic Division (Eastern)' : 'Eastern';
	const pacificText = atlanticPacificTeams.includes(dataset.dataset) ? 'Pacific Division (Western)' : 'Western';

	const trimmedAtlantic = atlanticPacificTeams.includes(dataset.dataset) ? atlanticText.slice(0, -10) : 'Eastern';
	const trimmedPacific = atlanticPacificTeams.includes(dataset.dataset) ? pacificText.slice(0, -10) : 'Western';
	return (
		<>
			<p className="scroll-m-20 text-base tracking-normal">
				Teams are divided into{' '}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					{trimmedAtlantic}
				</code>{' '}
				and{' '}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					{trimmedPacific}
				</code>
				. <span className="text-primary-foreground">{dataset.name}</span> had the following teams:
			</p>
			<div className="flex flex-col gap-3">
				<div className="flex flex-col">
					<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
						{/* <Compass className="opacity-80 w-5 h-5" /> */}
						<h3 className="">{atlanticText}</h3>
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
						<h3 className="">{pacificText}</h3>
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
		</>
	);
}

function OWCSTeams({ dataset }: { dataset: CombinedDatasetMetadata }) {
	const emeaTeams = getEmea('owcs-s2');
	const naTeams = getNa('owcs-s2');
	const koreaTeams = getKr('owcs-s2');

	return (
		<>
			<p className="scroll-m-20 text-base tracking-normal">
				Teams are divided into{' '}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					EMEA
				</code>{' '}
				,
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					North America
				</code>{' '}
				and{' '}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					Korea
				</code>
				. <span className="text-primary-foreground">{dataset.name}</span> has the following teams:
			</p>
			<div className="flex flex-col gap-3">
				<div className="flex flex-col">
					<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
						{/* <Compass className="opacity-80 w-5 h-5" /> */}
						<h3 className="">EMEA</h3>
					</div>
					<div className="flex w-full gap-0 sm:gap-1 flex-wrap">
						{emeaTeams?.map((team) => (
							<div className="w-14 sm:w-[4.5rem] h-14 sm:h-[4.5rem]" key={team}>
								<TeamLogo teamName={team} useTabIndex className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]" />
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col w-full">
					<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
						{/* <Compass className="opacity-80 w-5 h-5" /> */}
						<h3 className="">North America</h3>
					</div>
					<div className="flex w-full gap-0 sm:gap-1 flex-wrap">
						{naTeams?.map((team) => (
							<div className="w-14 sm:w-[4.5rem] h-14 sm:h-[4.5rem]" key={team}>
								<TeamLogo teamName={team} useTabIndex className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]" />
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col w-full">
					<div className="flex gap-2 items-center scroll-m-20 pb-2 text-xl font-semibold tracking-tight">
						{/* <Compass className="opacity-80 w-5 h-5" /> */}
						<h3 className="">Korea</h3>
					</div>
					<div className="flex w-full gap-0 sm:gap-1 flex-wrap">
						{koreaTeams?.map((team) => (
							<div className="w-14 sm:w-[4.5rem] h-14 sm:h-[4.5rem]" key={team}>
								<TeamLogo teamName={team} useTabIndex className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]" />
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}

function OWLHeaderText() {
	return (
		<blockquote className="sm:leading-7 tracking-wide opacity-90 border-l-[3px] pl-4 mt-1">
			Guess the correct Overwatch League player within 8 attempts to win (inspired by wordle). After each guess, you will receive hints based on attributes like
			the player's role, team, region and nationality to help you get closer to the right answer.
		</blockquote>
	);
}

function OWCSHeaderText() {
	return (
		<blockquote className="sm:leading-7 tracking-wide opacity-90 border-l-[3px] pl-4 mt-1">
			Guess the correct <LinkButton href={'https://esports.overwatch.com/'}>Overwatch Champion Series</LinkButton> (OWCS) player within 8 attempts to win
			(inspired by wordle). After each guess, you will receive hints based on attributes like the player's role, team, region and nationality to help you get
			closer to the right answer.
		</blockquote>
	);
}
