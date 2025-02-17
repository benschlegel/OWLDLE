'use client';
import type { DemoCell } from '@/components/game-container/dialogs/HelpContent';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLongPress } from '@uidotdev/usehooks';
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
	const tooltip = cellData.description;

	const attrs = useLongPress(
		() => {
			console.log('finished');
			setOpen(true);
		},
		{
			onCancel: (event) => setOpen(false),
			threshold: 500,
		}
	);

	const handleOpen = useCallback(() => {
		setOpen(true);
	}, []);

	const handleToggle = useCallback(() => {
		setOpen((open) => !open);
	}, []);

	const ButtonContent = <p className="text-opacity-100 leading-4 text-sm">{cellData.text}</p>;

	const ButtonProps = {
		...attrs,
		type: 'button' as const,
		id,
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
				<TooltipTrigger asChild tabIndex={!ignoreTabIndex ? 0 : -1} onBlur={() => setOpen(false)}>
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
