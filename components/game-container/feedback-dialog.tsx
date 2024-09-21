'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useState, type PropsWithChildren } from 'react';

type Props = {
	showFeedbackParam?: string | string[] | undefined;
};

export function FeedbackDialog({ children, showFeedbackParam }: PropsWithChildren<Props>) {
	const [open, setOpen] = useState(showFeedbackParam === 'true');
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<FeedbackContent setIsOpen={setOpen} />
		</Dialog>
	);
}
