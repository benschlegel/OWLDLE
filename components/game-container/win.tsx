'use client';
import { useEffect, useState } from 'react';
import Countdown, { type CountdownRenderProps, type CountdownRendererFn } from 'react-countdown';

type Props = {
	nextReset: Date;
};

function renderer({ days, hours, minutes, seconds, completed, milliseconds }: CountdownRenderProps) {
	if (completed) {
		// Render a completed state
		return <>Countdown over</>;
	}
	// Render a countdown
	return (
		<p>
			<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>:<span>{milliseconds}</span>
		</p>
	);
}

export default function WinScreen({ nextReset }: Partial<Props>) {
	if (nextReset === undefined) return <p />;
	const [showTimer, setShowTimer] = useState(false);

	useEffect(() => {
		setShowTimer(true);
	}, []);
	return (
		<div className="flex p-8 mt-4 w-full">
			<p>Test</p>
			{showTimer && <Countdown date={nextReset} renderer={renderer} />}
		</div>
	);
}
