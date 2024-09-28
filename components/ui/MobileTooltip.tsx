'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

const Tip = ({ content, children, className }: React.PropsWithChildren<{ content: string | React.ReactNode; className?: string }>) => {
	const [open, setOpen] = useState(false);

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip open={open}>
				<TooltipTrigger asChild>
					<button
						type="button"
						className={className}
						onClick={() => setOpen(!open)}
						onMouseEnter={() => setOpen(true)}
						onMouseLeave={() => setOpen(false)}
						onTouchStart={() => setOpen(!open)}
						onKeyDown={(e) => {
							e.preventDefault();
							e.key === 'Enter' && setOpen(!open);
						}}>
						{children}
					</button>
				</TooltipTrigger>
				<TooltipContent className={!content ? 'hidden' : ''}>
					<span className="inline-block">{content}</span>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
