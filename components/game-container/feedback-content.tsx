'use client';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/ui/rate-stars';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Feedback } from '@/types/server';
import type React from 'react';
import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';

const initialRating = -1;

type Props = {
	setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function FeedbackContent({ setIsOpen }: Props) {
	const [rating, setRating] = useState(initialRating);
	const [name, setName] = useState('');
	const [feedback, setFeedback] = useState('');
	const trimmedFeedback = feedback.trim();
	const { toast } = useToast();

	const handleChildValueChange = useCallback((newValue: number) => {
		setRating(newValue);
	}, []);

	const handleSubmit = useCallback(() => {
		// Format feedback content
		const feedbackContent: Feedback = { rating: rating >= 0.5 ? rating : undefined, name: name === '' ? undefined : name, feedback };
		fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedbackContent) })
			.then((res) => {
				if (res.status === 200) {
					setFeedback('');
					setRating(initialRating);
					setIsOpen(false);
					toast({
						title: 'Feedback sent!',
						description: 'Thanks for your feedback ❤️',
					});
				} else {
					toast({
						title: 'Server error',
						description: "Can't reach server or invalid data.",
						variant: 'destructive',
					});
				}
			})
			.catch((e) => {
				toast({
					title: 'Server error',
					description: "Can't reach server or invalid data.",
					variant: 'destructive',
				});
			});
	}, [rating, name, feedback, setIsOpen, toast]);

	const handleTextAreaSubmit = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				handleSubmit();
			}
		},
		[handleSubmit]
	);

	return (
		<DialogContent className="sm:max-w-[32rem]">
			<DialogHeader>
				<DialogTitle className="text-left">Feedback</DialogTitle>
				<DialogDescription className="text-left">
					If you have any suggestions, encountered any bugs or want to leave just leave feedback, you can do so here!
				</DialogDescription>
			</DialogHeader>
			<div className="grid gap-6 py-4">
				<div className="grid grid-cols-4 items-center gap-4 grid-flow-row">
					<Label htmlFor="name" className="text-left w-full col-span-4">
						Name <span className="opacity-60">(optional)</span>
					</Label>
					<Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-4 " />
				</div>
				<div className="grid grid-cols-4 items-start gap-4">
					<Label htmlFor="feedback" className="text-left w-full col-span-4">
						Feedback<span className="text-primary-foreground">*</span>
					</Label>
					<Textarea
						onKeyDown={handleTextAreaSubmit}
						id="feedback"
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						className="col-span-4 max-h-52 h-24 md:h-32"
					/>
				</div>
				<div className="grid grid-cols-4 items-center gap-[0.6rem] grid-flow-row">
					<Label htmlFor="name" className="text-left w-full col-span-4">
						Rating <span className="opacity-60">(optional)</span>
					</Label>
					<StarRating onChange={handleChildValueChange} />
				</div>
			</div>
			<DialogFooter>
				<Button type="submit" disabled={trimmedFeedback.length < 1} onClick={handleSubmit}>
					Send feedback
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
