'use client';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircleHelpIcon } from 'lucide-react';

type Props = {
	setIsOpen: (old: boolean) => void;
};

export default function HelpContent({ setIsOpen }: Props) {
	return (
		<DialogContent className="sm:max-w-[50rem]">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					How to play
				</DialogTitle>
				<DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button type="submit" variant="outline">
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
