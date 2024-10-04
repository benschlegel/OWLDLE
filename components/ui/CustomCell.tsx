'use client';
import type { DemoCell } from '@/components/game-container/HelpContent';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect, useCallback, useRef } from 'react';

type Props = {
	cellData: Partial<DemoCell>;
	ignoreTabIndex?: boolean;
	id?: string;
	isSmall?: boolean;
	debounceTime?: number;
};

export default function CustomCell({ cellData, id, ignoreTabIndex, isSmall, debounceTime = 100 }: Props) {
	const [open, setOpen] = useState(false);
	const tooltipRef = useRef<HTMLButtonElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tooltip = cellData.description;

	const clearPendingTimeout = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const handleOpen = useCallback(() => {
		clearPendingTimeout();
		timeoutRef.current = setTimeout(() => {
			if (tooltipRef.current?.matches(':hover')) {
				setOpen(true);
			}
		}, debounceTime);
	}, [clearPendingTimeout, debounceTime]);

	const handleToggle = useCallback(() => {
		clearPendingTimeout();
		timeoutRef.current = setTimeout(() => {
			setOpen((prevOpen) => !prevOpen);
		}, debounceTime);
	}, [clearPendingTimeout, debounceTime]);

	useEffect(() => {
		return clearPendingTimeout;
	}, [clearPendingTimeout]);

	const ButtonContent = <p className="text-opacity-100 leading-4 text-sm">{cellData.text}</p>;

	const ButtonProps = {
		type: 'button' as const,
		id,
		ref: tooltipRef,
		style: { backgroundColor: cellData.bgColor, color: cellData.color },
		onClick: !ignoreTabIndex ? handleToggle : undefined,
		onMouseEnter: !ignoreTabIndex ? handleOpen : undefined,
		onMouseLeave: !ignoreTabIndex ? () => setOpen(false) : undefined,
		onTouchStart: !ignoreTabIndex ? handleToggle : undefined,
		'aria-label': 'Open tooltip',
		'aria-expanded': open,
	};

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip open={open}>
				<TooltipTrigger asChild tabIndex={!ignoreTabIndex ? 0 : -1}>
					{!isSmall ? (
						<button
							{...ButtonProps}
							className={`sm:w-[3.7rem] w-[3rem] sm:h-[3.7rem] h-[3rem] rounded-sm flex items-center justify-center p-2 ${cellData.isLarge && 'flex-1'} text-opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 cursor-default`}>
							{ButtonContent}
						</button>
					) : (
						<button
							{...ButtonProps}
							className={`w-[2.5rem] h-[2.5rem] sm:w-[3rem] sm:h-[3rem] rounded-sm flex items-center justify-center p-2 ${cellData.isLarge && 'flex-1'} text-opacity-85 cursor-default`}>
							{ButtonContent}
						</button>
					)}
				</TooltipTrigger>
				<TooltipContent className={`${ignoreTabIndex ? '!hidden' : ''}`} style={{ backgroundColor: cellData.bgColor, color: cellData.color }}>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
