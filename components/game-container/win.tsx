'use client';
import { SwitchableButton } from '@/components/ui/switchable-button';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useContext, useLayoutEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';

type Props = {
	nextReset: Date;
	formattedResult: string;
};

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

export default function WinScreen({ nextReset, formattedResult }: Partial<Props>) {
	const [_, setGameState] = useContext(GameStateContext);
	const [guesses, setGuesses] = useContext(GuessContext);
	const [showTimer, setShowTimer] = useState(true);

	// Fix hydration warning for mismatching countdown time
	useLayoutEffect(() => {
		setShowTimer(true);
	}, []);

	if (nextReset === undefined) return <></>;

	return (
		<div className="flex p-4 gap-1 justify-center items-center mt-4 w-full flex-col">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">🎉 You won! 🎉</h1>
			<div className="flex gap-2 items-center justify-center opacity-80">
				<p>Time until next reset:</p>
				{showTimer && (
					<Countdown
						date={nextReset}
						renderer={renderer}
						autoStart
						onComplete={() => {
							setGameState('in-progress');
							setGuesses([]);
						}}
					/>
				)}
			</div>
			<SwitchableButton className="w-72 mt-3" onClick={() => navigator.clipboard.writeText(formattedResult ?? '')} switchedContent={<SwitchedButtonContent />}>
				<DefaultButtonContent />
			</SwitchableButton>
		</div>
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
