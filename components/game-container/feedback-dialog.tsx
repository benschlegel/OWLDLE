import FeedbackContent from '@/components/game-container/feedback-content';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquareTextIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';

export function FeedbackDialog({ children }: PropsWithChildren) {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<FeedbackContent />
		</Dialog>
	);
}
