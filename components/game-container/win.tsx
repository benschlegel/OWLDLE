'use client';
import { GameStateContext } from '@/context/GameStateContext';
import { GuessContext } from '@/context/GuessContext';
import { useContext, useLayoutEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, zeroPad } from 'react-countdown';

type Props = {
	nextReset: Date;
};

function renderer({ days, hours, minutes, seconds, completed }: CountdownRenderProps) {
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

export default function WinScreen({ nextReset }: Partial<Props>) {
	const [_, setGameState] = useContext(GameStateContext);
	const [guesses, setGuesses] = useContext(GuessContext);
	const [showTimer, setShowTimer] = useState(true);

	// Fix hydration warning for mismatching countdown time
	useLayoutEffect(() => {
		setShowTimer(true);
	}, []);

	if (nextReset === undefined) return <></>;
	return (
		<div className="flex p-8 mt-4 w-full flex-col">
			<h1>You won!</h1>
			<div className="flex gap-2">
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
		</div>
	);
}
