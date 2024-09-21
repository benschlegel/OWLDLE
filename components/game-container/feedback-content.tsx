import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/ui/rate-stars';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

export default function FeedbackContent() {
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
					<Input id="name" defaultValue="" className="col-span-4 " />
				</div>
				<div className="grid grid-cols-4 items-start gap-4">
					<Label htmlFor="feedback" className="text-left w-full col-span-4">
						Feedback
					</Label>
					<Textarea id="feedback" defaultValue="" className="col-span-4 max-h-52 h-24 md:h-32" />
				</div>
				<div className="grid grid-cols-4 items-center gap-[0.6rem] grid-flow-row">
					<Label htmlFor="name" className="text-left w-full col-span-4">
						Rating <span className="opacity-60">(optional)</span>
					</Label>
					<StarRating />
				</div>
			</div>
			<DialogFooter>
				<Button type="submit">Send feedback</Button>
			</DialogFooter>
		</DialogContent>
	);
}
