import { FeedbackTriggerButton, FeedbackDialog } from '@/components/game-container/dialogs/feedback-dialog';
import { HelpDialog, HelpTriggerButton } from '@/components/game-container/dialogs/HelpDialog';
import { ModeToggle } from '@/components/theme-switcher';
import { Separator } from '@/components/ui/separator';
import { Suspense, type ReactNode } from 'react';

interface GameHeaderProps {
	modeLabel: string;
	seasonSelector: ReactNode;
	seasonTitle: ReactNode;
	topLabel?: ReactNode;
}

export default function GameHeader({ modeLabel, seasonSelector, seasonTitle, topLabel }: GameHeaderProps) {
	return (
		<div className=" top-0 bg-transparent sm:bg-inherit z-10 pt-4 w-full">
			{topLabel}
			<p className="sm:text-xl text-base font-bold text-center sm:ml-0 ml-[1.5rem] font-owl">
				<span className="text-primary-foreground">{modeLabel}</span>
			</p>
			<div className="flex flex-row justify-between items-center w-full">
				<div className="flex gap-2 items-center">
					<Suspense fallback={HelpTriggerButton}>
						<HelpDialog />
					</Suspense>
					{seasonSelector}
				</div>
				<div className="mb-1 flex items-center">
					<h1 className="sm:text-3xl text-2xl font-bold text-center sm:ml-[-1rem] font-owl">
						<Suspense fallback="Season 1">{seasonTitle}</Suspense>
					</h1>
				</div>
				<div className="flex gap-1">
					<Suspense fallback={FeedbackTriggerButton}>
						<FeedbackDialog />
					</Suspense>
					<ModeToggle />
				</div>
			</div>
			<Separator className="mb-6 mt-1 transition-colors duration-300" />
		</div>
	);
}
