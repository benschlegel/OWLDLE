import React, { type PropsWithChildren } from 'react';

type Props = {
	isLarge?: boolean;
	cellSize: string;
};

export default function GameCell({ isLarge = false, cellSize, children }: PropsWithChildren<Props>) {
	return <div className={`w-[3.7rem] bg-secondary rounded-sm transition-colors ${isLarge ? 'flex-1' : ''}`}>{children}</div>;
}
