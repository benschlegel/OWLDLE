'use client';
import { SwitchableButton } from '@/components/ui/switchable-button';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { useGuessStorage } from '@/context/GuessStorageContext';
import type { Dataset } from '@/data/datasets';
import type { PlausibleEvents } from '@/types/plausible';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { usePlausible } from 'next-plausible';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';

type Props = {
	nextReset: Date;
	formattedResult: string;
	correctPlayer: string;
	dataset: Dataset;
};

export default function WinScreen({ nextReset, correctPlayer, formattedResult, dataset }: Partial<Props>) {
	const [gameState, setGameState] = useContext(GameStateContext);
	const { setPlayerGuesses } = useGuessStorage();
	const [showTimer, setShowTimer] = useState(true);
	const plausible = usePlausible<PlausibleEvents>();

	// Fix hydration warning for mismatching countdown time
	useLayoutEffect(() => {
		setShowTimer(true);
	}, []);

	useEffect(() => {
		if (gameState === 'lost') {
			const element = document.getElementById('lost');
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}, [gameState]);

	if (nextReset === undefined) return <></>;

	return (
		<div id="lost" className="flex p-4 gap-2 justify-center items-center mt-4 w-full flex-col">
			<h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">❌ You lost... ❌</h1>
			<h3 className="text-xl tracking-tight mt-1 text-center">
				The correct answer was:{' '}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-lg font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					{correctPlayer}
				</code>
			</h3>
			<div className="flex gap-2 items-center justify-center opacity-80">
				<p>Time until next reset:</p>
				{showTimer && (
					<Countdown
						date={nextReset}
						renderer={renderer}
						autoStart
						onComplete={() => {
							if (nextReset !== undefined && nextReset > new Date()) {
								setGameState('in-progress');
								setPlayerGuesses([]);
							}
						}}
					/>
				)}
			</div>
			<SwitchableButton
				className="max-w-[20rem] mt-3 box-border px-4"
				onClick={() => {
					navigator.clipboard.writeText(formattedResult ?? '');
					plausible('copyResult', { props: { state: 'lost', dataset: dataset ?? 'season1' } });
				}}
				switchedContent={<SwitchedButtonContent />}>
				<DefaultButtonContent />
			</SwitchableButton>
		</div>
	);
}

function renderer({ days, hours, minutes, seconds, milliseconds, completed }: CountdownRenderProps) {
	if (completed) {
		// Render a completed state
		return <></>;
	}
	// Render a countdown
	return (
		<p className="gap-2 font-mono font-bold mt-[2px]">
			<span>{zeroPad(hours)}</span>:<span>{zeroPad(minutes)}</span>:<span>{zeroPad(seconds)}</span>
		</p>
	);
}

function DefaultButtonContent() {
	return (
		<div className="flex flex-row justify-center items-center  gap-2 ">
			<p className="dark:text-[#dfdfd7] text-white w-auto text-lg font-mono tracking-tight">Copy result to clipboard</p>
			<CopyIcon className="h-4 w-4 dark:text-[#dfdfd7] text-white" />
		</div>
	);
}

function SwitchedButtonContent() {
	return (
		<div className="flex flex-row justify-center items-center gap-1">
			<p className="dark:text-[#dfdfd7] text-white w-auto text-lg font-mono tracking-tight">Copied!</p>
			<CheckIcon className="h-5 w-5 dark:text-[#dfdfd7] text-white" />
		</div>
	);
}
