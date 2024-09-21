import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquareTextIcon } from 'lucide-react';

export function FeedbackDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				{/* <Button variant="outline">Edit Profile</Button> */}
				<Button variant="ghost" size="icon" className="p-0">
					<MessageSquareTextIcon className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Send feedback</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Feedback</DialogTitle>
					<DialogDescription>If you have any suggestions, encountered any bugs or want to leave just leave feedback, you can do so here!</DialogDescription>
				</DialogHeader>
				<div className="grid gap-5 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name (optional)
						</Label>
						<Input id="name" defaultValue="" className="col-span-3" />
					</div>
					<div className="grid grid-cols-4 items-start gap-4">
						<Label htmlFor="feedback" className="text-right pt-2">
							Feedback
						</Label>
						<Textarea id="feedback" defaultValue="" className="col-span-3 max-h-52 h-32" />
					</div>
				</div>
				<DialogFooter>
					<Button type="submit">Send feedback</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
