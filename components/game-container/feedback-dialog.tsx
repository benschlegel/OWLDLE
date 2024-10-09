'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquareTextIcon } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';

export function FeedbackDialog() {
	const [open, setOpen] = useQueryState('showFeedback', parseAsBoolean.withDefault(false));
	return (
		<Dialog open={open} onOpenChange={(val) => (val === true ? setOpen(true) : setOpen(null))}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="p-0"
					onClick={() => {
						setOpen(null);
					}}>
					<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Send feedback</span>
				</Button>
			</DialogTrigger>
			<FeedbackContent setIsOpen={setOpen} />
		</Dialog>
	);
}

export const FeedbackTriggerButton = (
	<Button variant="ghost" size="icon" className="p-0">
		<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
		<span className="sr-only">Send feedback</span>
	</Button>
);
