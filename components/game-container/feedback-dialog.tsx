'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type PropsWithChildren } from 'react';

export function FeedbackDialog({ children }: PropsWithChildren) {
	const searchParams = useSearchParams();
	const showFeedback = searchParams.get('showFeedback');
	const [open, setOpen] = useState(showFeedback === 'true');
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
