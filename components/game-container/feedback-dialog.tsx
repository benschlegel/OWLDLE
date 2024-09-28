'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';

type Props = {
	slug: string;
};

export function FeedbackDialog({ children, slug }: PropsWithChildren<Props>) {
	const searchParams = useSearchParams();
	const showFeedback = searchParams.get('showFeedback');
	const [open, setOpen] = useState(showFeedback === 'true');
	const router = useRouter();

	useEffect(() => {
		if (open === false) {
			handleClose();
		}
	}, [open]);

	const handleClose = useCallback(() => {
		router.replace(slug);
	}, [router, slug]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<FeedbackContent setIsOpen={setOpen} />
		</Dialog>
	);
}
