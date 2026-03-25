'use client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDialogState } from '@/hooks/use-dialog-param';
import { ChevronRight, SettingsIcon } from 'lucide-react';
import { useCallback } from 'react';

type Props = {
	setSheetOpen: (value: React.SetStateAction<boolean>) => void;
};
export default function HamburgerSheetContent({ setSheetOpen }: Props) {
	const { setOpen: setFeedbackOpen } = useDialogState('feedback');
	const { setOpen: setHelpOpen } = useDialogState('help');
	const { setOpen: setSettingsOpen } = useDialogState('settings');

	const onFeedbackClick = useCallback(() => {
		setFeedbackOpen(true);
		setSheetOpen(false);
	}, [setFeedbackOpen, setSheetOpen]);

	const onHelpClick = useCallback(() => {
		setHelpOpen(true);
		setSheetOpen(false);
	}, [setHelpOpen, setSheetOpen]);

	const onSettingsClick = useCallback(() => {
		setSettingsOpen(true);
		setSheetOpen(false);
	}, [setSettingsOpen, setSheetOpen]);
	return (
		<SheetContent side="right" showCloseButton={false}>
			<div className="w-full h-12 bg-card shadow-sm sticky top-0 flex items-center justify-center">
				<div className="bg-background shadow-sm sm:px-10 px-6 h-full flex items-center -skew-x-12">
					<h1 className="sm:text-4xl text-3xl font-bold text-center w-full font-owl skew-x-12">
						<span className="text-primary-foreground">OWL</span>
						<span className="text-foreground">DLE</span>
					</h1>
				</div>
			</div>
			<div className="flex flex-col gap-4 px-4">
				<div className="flex">
					<h1 className="font-bold sm:text-2xl text-xl font-owl text-foreground">Navigation</h1>
				</div>
				<div className="flex flex-col">
					<h1 className="font-bold sm:text-2xl text-xl font-owl text-foreground">Links</h1>
					<div className="mt-2 flex flex-col gap-2 justify-center">
						<Separator />
						<Button variant={'ghost'} className="justify-start group hover:bg-inherit *:transition-colors" onClick={onFeedbackClick}>
							<span className="flex-1 text-left group-hover:text-primary-foreground">Feedback</span>
							<ChevronRight className="size-5 text-foreground group-hover:text-primary-foreground" />
						</Button>
						<Separator />
					</div>
				</div>
			</div>
			<SheetFooter>
				<Button variant={'default'} className="h-auto py-1.5 gap-1" onClick={onSettingsClick}>
					<SettingsIcon className="size-4" />
					Settings
				</Button>
				<SheetClose
					render={
						<Button variant="outline" className="h-auto py-1.5" autoFocus>
							Close
						</Button>
					}
				/>
			</SheetFooter>
		</SheetContent>
	);
}
