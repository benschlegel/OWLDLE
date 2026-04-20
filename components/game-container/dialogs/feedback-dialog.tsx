'use client';
import FeedbackContent from '@/components/game-container/dialogs/feedback-content';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { type DialogKey, useDialogState } from '@/hooks/use-dialog-param';
import { MessageSquareTextIcon } from 'lucide-react';

const DIALOG_KEY = 'feedback' satisfies DialogKey;

export function FeedbackDialog() {
	const { open, setOpen } = useDialogState(DIALOG_KEY);
	return (
		<Dialog open={open} onOpenChange={(val) => (val === true ? setOpen(true) : setOpen(false))}>
			<FeedbackContent setOpen={setOpen} />
		</Dialog>
	);
}

export function FeedbackTriggerButton() {
	const { setOpen } = useDialogState(DIALOG_KEY);
	return (
		<Button variant="ghost" size="icon" className="p-0" onClick={() => setOpen(true)}>
			<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
			<span className="sr-only">Send feedback</span>
		</Button>
	);
}

export const FeedbackTriggerButtonFallback = (
	<Button variant="ghost" size="icon" className="p-0">
		<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
		<span className="sr-only">Send feedback</span>
	</Button>
);
