import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleHelpIcon } from 'lucide-react';
import { useCallback } from 'react';

type Props = {
	setOpen: (value: boolean) => void;
};
export default function TeamsContent({ setOpen }: Props) {
	const handleClose = useCallback(() => {
		setOpen(false);
	}, [setOpen]);
	return (
		<DialogContent className="sm:max-w-[48rem] max-h-full py-6 px-3 md:px-7" aria-describedby="Participating teams.">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center text-left font-owl">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
					Teams
				</DialogTitle>
				{/* <DialogDescription className="mt-2 text-left mb-0">Tutorial</DialogDescription> */}
			</DialogHeader>
			<ScrollArea type="scroll" className="h-128">
				<main className="h-full w-full flex flex-col gap-6 px-2 pb-2 text-wrap wrap-break-word ">{/* Placeholder */}</main>
			</ScrollArea>
			<DialogFooter>
				<Button type="submit" variant="outline" autoFocus onClick={handleClose}>
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
