'use client';
import FeedbackContent from '@/components/game-container/dialogs/feedback-content';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { type DialogKey, useDialogState } from '@/hooks/use-dialog-param';
import { MessageSquareTextIcon } from 'lucide-react';

const DIALOG_KEY = 'feedback' satisfies DialogKey;

export function FeedbackDialog() {
	const { open, setOpen } = useDialogState(DIALOG_KEY);
	return (
		<Dialog open={open} onOpenChange={(val) => (val === true ? setOpen(true) : setOpen(false))}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="p-0"
					onClick={() => {
						setOpen(false);
					}}>
					<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Send feedback</span>
				</Button>
			</DialogTrigger>
			<FeedbackContent setOpen={setOpen} />
		</Dialog>
	);
}

export const FeedbackTriggerButton = (
	<Button variant="ghost" size="icon" className="p-0">
		<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
		<span className="sr-only">Send feedback</span>
	</Button>
);
