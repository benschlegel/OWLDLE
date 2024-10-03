'use client';
import { FeedbackDialog } from '@/components/game-container/feedback-dialog';
import { HelpDialog } from '@/components/game-container/HelpDialog';
import SeasonSelector from '@/components/game-container/SeasonSelector';
import { ModeToggle } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CircleHelpIcon } from 'lucide-react';

type Props = {
	slug: string;
};

export default function Header({ slug }: Props) {
	return (
		<>
			<div className="flex flex-row justify-between items-center w-full">
				<div className="flex gap-2 items-center">
					<HelpDialog>
						<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
							<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
						</Button>
					</HelpDialog>
					<SeasonSelector slug={slug} />
				</div>
				<div className="mb-1 flex items-center">
					<div className="absolute left-1/2 transform -translate-x-1/2 text-center">
						<h1
							className="sm:text-4xl text-3xl font-bold text-center"
							style={{
								fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
							}}>
							<span className="text-primary-foreground">OWL</span>
							DLE
						</h1>
					</div>
				</div>
				<div className="flex gap-1">
					<FeedbackDialog />
					<ModeToggle />
				</div>
			</div>
			<Separator className="mb-6 mt-1 transition-colors duration-300" />
		</>
	);
}
