'use client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { splitCapitalization } from '@/lib/client';
import { cn } from '@/lib/utils';
import type React from 'react';
import { useState, type PropsWithChildren } from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	isLarge?: boolean;
	/**
	 * Wether cell is correct or not (sets background color)
	 */
	isCorrect?: boolean;
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
	 * Style for tooltip content
	 */
	tooltipClassname?: string;
	/**
	 * Ignores tab index (ability to be navigated with tab/keyboard) when set to true
	 */
	ignoreTabIndex?: boolean;
}

export default function GameCell({
	isLarge = false,
	isCorrect,
	tooltipClassname,
	tooltipValue,
	className,
	children,
	ignoreTabIndex,
	tooltipDescription,
	tooltipGuess,
}: PropsWithChildren<Props>) {
	const [open, setOpen] = useState(false);
	// Set background color based on correct value (gray if undefined, green if correct, red if incorrect)
	let bgColor = 'bg-secondary';
	if (isCorrect === true) {
		bgColor = 'bg-correct !text-white opacity-90';
	} else if (isCorrect === false) {
		bgColor = 'bg-incorrect !text-white opacity-90';
	}

	// Set tooltip for cell (tooltipDescription if defined, e.g. "correct ${tooltipDescription}" if tooltipGuess undefined)
	let tooltip = isCorrect === undefined ? tooltipDescription : tooltipGuess;
	if (tooltipGuess === undefined && isCorrect !== undefined) {
		const prefix = !isCorrect ? 'Incorrect' : 'Correct';
		tooltip = `${prefix} ${tooltipDescription}${tooltipValue ? ` (${isLarge === false ? splitCapitalization(tooltipValue) : tooltipValue})` : ''}`;
	}
	return (
		<>
			<TooltipProvider delayDuration={0}>
				<Tooltip open={open}>
					<TooltipTrigger asChild tabIndex={!ignoreTabIndex ? 0 : -1}>
						<button
							type="button"
							className={cn(
								`sm:w-[3.7rem] w-[3rem] sm:h-[3.7rem] h-[3rem] ${bgColor} rounded-sm transition-colors ${isLarge ? 'flex-1' : ''} cursor-default select-text`,
								className
							)}
							onClick={() => setOpen(!open)}
							onMouseEnter={() => setOpen(true)}
							onMouseLeave={() => setOpen(false)}
							onTouchStart={() => setOpen(!open)}
							aria-label="Open tooltip"
							onFocus={() => setOpen(true)}
							onBlur={() => setOpen(false)}>
							{children}
						</button>
					</TooltipTrigger>
					<TooltipContent className={cn(bgColor === 'bg-secondary' ? 'bg-card' : bgColor, tooltipClassname, 'text-text')}>
						{tooltip && tooltip.length > 0 && <p>{tooltip}</p>}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</>
	);
}
