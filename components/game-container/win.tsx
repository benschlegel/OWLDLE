'use client';
import { SwitchableButton } from '@/components/ui/switchable-button';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { usePlausible } from 'next-plausible';
import type { PlausibleEvents } from '@/types/plausible';
import type { Dataset } from '@/data/datasets';
import FooterText from '@/components/footer-text';

type Props = {
	nextReset: Date;
	formattedResult: string;
	dataset: Dataset;
	/**
	 * Indicates wether state is old/came from local storage (e.g. dont play confetti if old)
	 */
	isOldState: boolean;
};

const DEFAULT_CONFETTI_DURATION = 7500;
const OLD_CONFETTI_DURATION = 500;

export default function WinScreen({ nextReset, formattedResult, dataset, isOldState }: Partial<Props>) {
	const [gameState, setGameState] = useContext(GameStateContext);
	const [_guesses, setGuesses] = useContext(GuessContext);
	const [showTimer, setShowTimer] = useState(true);
	const [showConfetti, setShowConfetti] = useState(true);
	const plausible = usePlausible<PlausibleEvents>();
	const confettiDuration = isOldState ? OLD_CONFETTI_DURATION : DEFAULT_CONFETTI_DURATION;

	const [showButtonConfetti, setShowButtonConfetti] = useState(false);

	useEffect(() => {
		if (gameState === 'won') {
			const element = document.getElementById('win');
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}, [gameState]);

	// Fix hydration warning for mismatching countdown time
	useLayoutEffect(() => {
		setShowTimer(true);
	}, []);

	// Stops running confetti after 'confettiDuration' amount of ms
	useEffect(() => {
		const timer = setTimeout(() => {
			if (showConfetti) {
				setShowConfetti(false);
			}
		}, confettiDuration);

		// Cleanup timeout on unmount
		return () => clearTimeout(timer);
	}, [showConfetti, confettiDuration]);

	const handleConfettiButton = useCallback(() => {
		plausible('clickConfetti', { props: { state: 'won' } });
		setShowConfetti(true);
	}, [plausible]);

	if (nextReset === undefined) return <></>;

	return (
		<div id="win" className="flex p-4 gap-1 justify-center items-center mt-4 w-full flex-col">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
				<Button
					className="p-0 py-8 text-4xl font-extrabold tracking-tight lg:text-5xl"
					variant="ghost"
					onClick={handleConfettiButton}
					aria-label="Show confetti">
					🎉
				</Button>{' '}
				You won!{' '}
				<Button
					className="p-0 py-8 text-4xl font-extrabold tracking-tight lg:text-5xl"
					variant="ghost"
					onClick={handleConfettiButton}
					aria-label="Show confetti">
					🎉
				</Button>
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
					setShowButtonConfetti(true);
				}}
				switchedContent={<SwitchedButtonContent />}>
				<DefaultButtonContent />
			</SwitchableButton>

			<Confetti numberOfPieces={showConfetti ? 200 : 0} className="overflow-none w-full h-full z-50 fixed top-0 left-0" />
			<Confetti
				numberOfPieces={showButtonConfetti ? 20 : 0}
				className="overflow-none w-full h-full z-50 fixed top-0 left-0"
				onConfettiComplete={(confetti) => {
					setShowButtonConfetti(false);
					confetti?.reset();
				}}
				recycle={false}
			/>
			<FooterText />
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
