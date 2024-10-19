'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DEFAULT_DIALOG_VALUE, type DialogKey, useDialogParams } from '@/hooks/use-dialog-param';
import { MessageSquareTextIcon } from 'lucide-react';

const DIALOG_KEY = 'feedback' satisfies DialogKey;

export function FeedbackDialog() {
	const [dialog, setDialog] = useDialogParams();
	const open = dialog === DIALOG_KEY;
	return (
		<Dialog open={open} onOpenChange={(val) => (val === true ? setDialog(DIALOG_KEY) : setDialog(DEFAULT_DIALOG_VALUE))}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="p-0"
					onClick={() => {
						setDialog(DEFAULT_DIALOG_VALUE);
					}}>
					<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Send feedback</span>
				</Button>
			</DialogTrigger>
			<FeedbackContent setDialog={setDialog} />
		</Dialog>
	);
}

export const FeedbackTriggerButton = (
	<Button variant="ghost" size="icon" className="p-0">
		<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
		<span className="sr-only">Send feedback</span>
	</Button>
);
