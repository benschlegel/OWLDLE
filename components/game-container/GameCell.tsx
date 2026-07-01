'use client';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMobileTooltip } from '@/hooks/use-mobile-tooltip';
import { cn } from '@/lib/utils';

export type CellState = 'correct' | 'partial' | 'incorrect';

export function toCellState(isCorrect?: boolean): CellState | undefined {
	if (isCorrect === undefined) return undefined;
	return isCorrect ? 'correct' : 'incorrect';
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	isLarge?: boolean;
	/**
	 * State of the cell (sets background color)
	 */
	cellState?: CellState;
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
	cellState,
	tooltipClassname,
	tooltipValue,
	className,
	children,
	ignoreTabIndex,
	tooltipDescription,
	tooltipGuess,
}: PropsWithChildren<Props>) {
	const { open, setOpen, triggerRef, touchHandlers } = useMobileTooltip();

	// Set background color based on cell state (gray if undefined, green if correct, orange if partial, red if incorrect)
	let bgColor = 'bg-secondary';
	if (cellState === 'correct') {
		bgColor = 'bg-correct !text-white opacity-90';
	} else if (cellState === 'incorrect') {
		bgColor = 'bg-incorrect !text-white opacity-90';
	} else if (cellState === 'partial') {
		bgColor = 'bg-partial !text-white opacity-90';
	}

	// Set tooltip for cell (tooltipDescription if defined, e.g. "correct ${tooltipDescription}" if tooltipGuess undefined)
	let tooltip = cellState === undefined ? tooltipDescription : tooltipGuess;
	if (tooltipGuess === undefined && cellState !== undefined) {
		const prefix = cellState === 'correct' ? 'Correct' : cellState === 'partial' ? 'Partially correct' : 'Incorrect';
		tooltip = `${prefix} ${tooltipDescription}${tooltipValue ? ` (${tooltipValue})` : ''}`;
	}
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip open={open}>
				<TooltipTrigger asChild tabIndex={!ignoreTabIndex ? 0 : -1}>
					<button
						ref={triggerRef as React.RefObject<HTMLButtonElement>}
						type="button"
						className={cn(
							`sm:w-[3.7rem] w-[3rem] sm:h-[3.7rem] h-[3rem] ${bgColor} rounded-sm transition-colors ${isLarge ? 'flex-1' : ''} cursor-default select-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`,
							className
						)}
						onClick={() => setOpen(!open)}
						onMouseEnter={() => setOpen(true)}
						onMouseLeave={() => setOpen(false)}
						{...touchHandlers}
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
	);
}
