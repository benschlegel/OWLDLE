'use client';
import FeedbackContent from '@/components/game-container/feedback-content';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import type { Options } from 'nuqs';
import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';

type Props = {
	slug: string;
	setOpen: <Shallow>(value: boolean | ((old: boolean) => boolean | null) | null, options?: Options<Shallow> | undefined) => Promise<URLSearchParams>;
	open: boolean;
};

export function FeedbackDialog({ children, slug, open, setOpen }: PropsWithChildren<Props>) {
	useEffect(() => {
		if (open === false) {
			handleClose();
		}
	}, [open]);

	const handleClose = useCallback(() => {
		setOpen(null);
	}, [setOpen]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<FeedbackContent setIsOpen={setOpen} />
		</Dialog>
	);
}
