'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type PropsWithChildren } from 'react';

type Props = {
	showFeedbackParam?: string | null;
};

export function FeedbackDialog({ children, showFeedbackParam }: PropsWithChildren<Props>) {
	const [open, setOpen] = useState(showFeedbackParam === 'true');
	const router = useRouter();

	useEffect(() => {
		if (open === false) {
			router.replace('/');
		}
	}, [open, router]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<FeedbackContent setIsOpen={setOpen} />
		</Dialog>
	);
}
