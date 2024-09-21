'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useState, type PropsWithChildren } from 'react';

export function FeedbackDialog({ children }: PropsWithChildren) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<FeedbackContent setIsOpen={setOpen} />
		</Dialog>
	);
}
