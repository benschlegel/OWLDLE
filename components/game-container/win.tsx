'use client';
import { SwitchableButton } from '@/components/ui/switchable-button';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useContext, useLayoutEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';
import { usePlausible } from 'next-plausible';
import type { PlausibleEvents } from '@/types/plausible';
import type { Dataset } from '@/data/datasets';
import FooterText from '@/components/footer-text';
import GameConfetti from '@/components/game-container/game-confetti';

type Props = {
	nextReset: Date;
	formattedResult: string;
	dataset: Dataset;
	/**
	 * Indicates wether state is old/came from local storage (e.g. dont play confetti if old)
	 */
	isOldState: boolean;
};

export default function WinScreen({ nextReset, formattedResult, dataset, isOldState }: Partial<Props>) {
	const [_gameState, setGameState] = useContext(GameStateContext);
	const [_guesses, setGuesses] = useContext(GuessContext);
	const [showTimer, setShowTimer] = useState(true);
	const plausible = usePlausible<PlausibleEvents>();

	// Fix hydration warning for mismatching countdown time
	useLayoutEffect(() => {
		setShowTimer(true);
	}, []);

	if (nextReset === undefined) return <></>;

	return (
		<div id="win" className="flex p-4 gap-1 justify-center items-center mt-4 w-full flex-col">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
				🎉 You won! 🎉
			</h1>
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
								setGuesses([]);
							}
						}}
					/>
				)}
			</div>
			<SwitchableButton
				className="max-w-[20rem] mt-3 box-border px-4"
				onClick={() => {
					navigator.clipboard.writeText(formattedResult ?? '');
					plausible('copyResult', { props: { state: 'won', dataset: dataset ?? 'season1' } });
				}}
				switchedContent={<SwitchedButtonContent />}>
				<DefaultButtonContent />
			</SwitchableButton>

			<GameConfetti isOldState={isOldState ?? false} />
			<FooterText />
		</div>
	);
}

function renderer({ hours, minutes, seconds, completed }: CountdownRenderProps) {
	if (completed) {
		return <></>;
	}
	return (
		<p className="gap-2 font-mono font-bold mt-0.5">
			<span>{zeroPad(hours)}</span>:<span>{zeroPad(minutes)}</span>:<span>{zeroPad(seconds)}</span>
		</p>
	);
}

function DefaultButtonContent() {
	return (
		<div className="flex flex-row justify-center items-center gap-2">
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
