'use client';
import { FeedbackDialog } from '@/components/game-container/feedback-dialog';
import { HelpDialog } from '@/components/game-container/HelpDialog';
import { ModeToggle } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CircleHelpIcon, MessageSquareTextIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, } from 'react';

export default function Header() {
	const router = useRouter();

	const feedbackButton = (
		<Button
			variant="ghost"
			size="icon"
			className="p-0"
			onClick={() => {
				router.replace('/?showFeedback=true');
			}}>
			<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
			<span className="sr-only">Send feedback</span>
		</Button>
	);
	return (
		<>
			<div className="flex flex-row justify-between items-center w-full">
				<HelpDialog>
					<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
						<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					</Button>
				</HelpDialog>
				<div className="mb-1 flex items-center">
					<h1
						className="sm:text-4xl text-3xl font-bold text-center"
						style={{
							fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
						}}>
						<span className="text-primary-foreground">OWL</span>
						{/* <span className="text-primary-foreground/70">S1</span>LE */}
						DLE
					</h1>
				</div>
				<div className="flex gap-1">
					<Suspense fallback={feedbackButton}>
						<FeedbackDialog>{feedbackButton}</FeedbackDialog>
					</Suspense>
					<ModeToggle />
				</div>
			</div>
			<Separator className="mb-6 mt-1 transition-colors duration-300" />
		</>
	);
}
