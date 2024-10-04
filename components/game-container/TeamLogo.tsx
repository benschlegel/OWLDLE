'use client';
import { getTeamLogo } from '@/data/teams/logos';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { splitCapitalization } from '@/lib/client';
import { cn } from '@/lib/utils';
import { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { DatasetContext } from '@/context/DatasetContext';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	teamName?: string;
	disableBorder?: boolean;
	useTabIndex?: boolean;
	debounceTime?: number;
}

export default function TeamLogo({ teamName, className, useTabIndex, disableBorder = false, debounceTime = 100 }: Props) {
	const [open, setOpen] = useState(false);
	const [dataset, _] = useContext(DatasetContext);
	const team = getTeamLogo(dataset.dataset, teamName ?? '');
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const logoRef = useRef<HTMLDivElement>(null);

	const clearPendingTimeout = useCallback(() => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const handleOpen = useCallback(() => {
		if (useTabIndex) {
			clearPendingTimeout();
			timeoutRef.current = setTimeout(() => {
				if (logoRef.current?.matches(':hover')) {
					setOpen(true);
				}
			}, debounceTime / 2);
		}
	}, [clearPendingTimeout, debounceTime, useTabIndex]);

	const handleClose = useCallback(() => {
		if (useTabIndex) {
			clearPendingTimeout();
			timeoutRef.current = setTimeout(() => {
				setOpen(false);
			}, debounceTime);
		}
	}, [clearPendingTimeout, debounceTime, useTabIndex]);

	const handleToggle = useCallback(() => {
		if (useTabIndex) {
			clearPendingTimeout();
			timeoutRef.current = setTimeout(() => {
				setOpen((prevOpen) => !prevOpen);
			}, debounceTime);
		}
	}, [clearPendingTimeout, debounceTime, useTabIndex]);

	useEffect(() => {
		return clearPendingTimeout;
	}, [clearPendingTimeout]);

	if (!teamName || !team) return <></>;

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip open={open}>
				<TooltipTrigger asChild>
					<div className="p-1">
						<div
							ref={logoRef}
							className={cn(
								`rounded-md relative w-full ${useTabIndex ? 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1' : ''}`,
								className
							)}
							style={{
								backgroundColor: team.backgroundColor,
								paddingBottom: '100%', // This creates the 1:1 aspect ratio
							}}
							tabIndex={useTabIndex ? 0 : -1}
							onFocus={handleOpen}
							onBlur={handleClose}>
							<button
								type="button"
								className="absolute inset-0 flex justify-center items-center p-[0.35rem] cursor-default"
								onClick={handleToggle}
								onMouseEnter={handleOpen}
								onMouseLeave={handleClose}
								onTouchStart={handleToggle}
								aria-label="Open tooltip"
								tabIndex={-1}>
								<Image
									src={team.imgUrl}
									alt={`Logo for ${team.displayName}`}
									unoptimized={false}
									quality={100}
									width={64}
									height={64}
									className=" h-auto w-auto max-h-full max-w-full object-contain"
								/>
							</button>
						</div>
					</div>
				</TooltipTrigger>
				{useTabIndex && (
					<TooltipContent style={{ backgroundColor: team.backgroundColor, color: team.useDarkForeground ? '#1a1a1e' : '#dfdfd7' }}>
						<p>{splitCapitalization(teamName)}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
}
