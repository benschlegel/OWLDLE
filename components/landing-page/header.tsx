import { FeedbackDialog } from '@/components/game-container/feedback-dialog';
import { ModeToggle } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CircleHelpIcon, MessageSquareTextIcon } from 'lucide-react';

export default function Header() {
	return (
		<>
			<div className="flex flex-row justify-between items-center w-full">
				<Button variant="ghost" size="icon" className="p-0">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
				</Button>
				<div className="mb-1 flex items-center">
					<h1 className="sm:text-4xl text-3xl font-bold text-center" style={{ fontFamily: 'var(--font-owl-bold)' }}>
						<span className="text-primary-foreground">OWL</span>
						{/* <span className="text-primary-foreground/70">S1</span>LE */}
						DLE
					</h1>
				</div>
				<div className="flex gap-1">
					<FeedbackDialog>
						<Button variant="ghost" size="icon" className="p-0">
							<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
							<span className="sr-only">Send feedback</span>
						</Button>
					</FeedbackDialog>
					<ModeToggle />
				</div>
			</div>
			<Separator className="mb-6 mt-1 transition-colors duration-300" />
		</>
	);
}
