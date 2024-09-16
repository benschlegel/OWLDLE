'use client';
import { Button } from '@/components/ui/button';
import { PressableButton } from '@/components/ui/pressable-button';
import { SwitchableButton } from '@/components/ui/switchable-button';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { CopyIcon } from 'lucide-react';
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
							setGuesses([]);
							setGameState('in-progress');
						}}
					/>
				)}
			</div>

			<PressableButton
				className="w-fit mt-2"
				icon={<CopyIcon className="h-4 w-4 dark:text-[#dfdfd7] text-white" />}
				onClick={() => navigator.clipboard.writeText(formattedResult ?? '')}>
				<p className="dark:text-[#dfdfd7] text-white scroll-m-20 text-lg font-mono tracking-tight">Copy result to clipboard</p>
			</PressableButton>
			<SwitchableButton
				className="w-conent mt-2"
				onClick={() => console.log('clicked')}
				switchedContent={<p className="dark:text-[#dfdfd7] text-white scroll-m-20 text-lg font-mono tracking-tight">Switched</p>}>
				<div className="flex flex-row justify-center items-center  gap-2 ">
					<p className="dark:text-[#dfdfd7] text-white w-auto text-lg font-mono tracking-tight">Copy abc to clipboard</p>
					<CopyIcon className="h-4 w-4 dark:text-[#dfdfd7] text-white" />
				</div>
			</SwitchableButton>
		</div>
	);
}
