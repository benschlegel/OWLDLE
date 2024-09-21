import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type React from 'react';
import type { PropsWithChildren } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	isLarge?: boolean;
	isCorrect?: boolean;
	cellSize?: string;
	/**
	 * Tooltip that will show while cell is empty (e.g. "Role")
	 */
	tooltipDescription?: string;
	/**
	 * Tooltip that will show after guess was made (e.g. "Playername")
	 */
	tooltipGuess?: string;
	/**
	 * Dynamic value for tooltip, works as suffix, (e.g. `Incorrect team (${tooltipValue})`)
	 */
	tooltipValue?: string;
	/**
	 * Custom cell color (e.g. for tutorial)
	 */
	customColor?: string;
}

export default function GameCell({
	isLarge = false,
	isCorrect,
	cellSize,
	customColor,
	tooltipValue,
	className,
	children,
	tooltipDescription,
	tooltipGuess,
}: PropsWithChildren<Props>) {
	// Set background color based on correct value (gray if undefined, green if correct, red if incorrect)
	let bgColor = 'bg-secondary';
	if (isCorrect === true) {
		bgColor = 'bg-green-600';
	} else if (isCorrect === false) {
		bgColor = 'bg-red-600';
	}
	if (customColor) {
		bgColor = customColor;
	}

	// Set tooltip for cell (tooltipDescription if defined, e.g. "correct ${tooltipDescription}" if tooltipGuess undefined)
	let tooltip = isCorrect === undefined ? tooltipDescription : tooltipGuess;
	if (tooltipGuess === undefined && isCorrect !== undefined) {
		const prefix = !isCorrect ? 'Incorrect' : 'Correct';
		tooltip = `${prefix} ${tooltipDescription}${tooltipValue ? ` (${tooltipValue.replace(/([A-Z])/g, ' $1').trim()})` : ''}`;
	}

	return (
		<>
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild tabIndex={0}>
						<div className={cn(`sm:w-[3.7rem] w-[3rem] ${bgColor} rounded-sm transition-colors ${isLarge ? 'flex-1' : ''}`, className)}>{children}</div>
					</TooltipTrigger>
					<TooltipContent className={className}>{tooltip && tooltip.length > 0 && <p>{tooltip}</p>}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</>
	);
}
