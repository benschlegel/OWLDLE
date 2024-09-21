'use client';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
	setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function HelpContent({ setIsOpen }: Props) {
	return (
		<DialogContent className="sm:max-w-[50rem]">
			<DialogHeader>
				<DialogTitle>How to play</DialogTitle>
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
