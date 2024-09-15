import React, { type PropsWithChildren } from 'react';

type Props = {
	isLarge?: boolean;
	isCorrect?: boolean;
	cellSize: string;
};

export default function GameCell({ isLarge = false, isCorrect, cellSize, children }: PropsWithChildren<Props>) {
	let bgColor = 'bg-secondary';
	if (isCorrect === true) {
		bgColor = 'bg-green-600';
	} else if (isCorrect === false) {
		bgColor = 'bg-red-600';
	}

	return <div className={`w-[3.7rem] ${bgColor} rounded-sm transition-colors ${isLarge ? 'flex-1' : ''}`}>{children}</div>;
}
