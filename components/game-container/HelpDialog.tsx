'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import HelpContent from '@/components/game-container/HelpContent';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useState, type PropsWithChildren } from 'react';

export function HelpDialog({ children }: PropsWithChildren) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<HelpContent setIsOpen={setOpen} />
		</Dialog>
	);
}
