'use client';
import { TWITTER_LINK } from '@/components/game-container/nav-bar';
import { DONATION_LINK, GITHUB_LINK, SocialPopoverContent } from '@/components/landing-page/socials';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SheetLinkButton } from '@/components/ui/sheet-link-button';
import { useDialogState } from '@/hooks/use-dialog-param';
import { SettingsIcon } from 'lucide-react';
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
				<div className="flex flex-col">
					<h1 className="font-bold sm:text-2xl text-xl font-owl text-foreground">Navigation</h1>
					<div className="mt-2 flex flex-col gap-2 justify-center">
						<Accordion type="single" defaultValue="" collapsible>
							<AccordionItem value="owl" className="border-none px-2">
								<AccordionTrigger className="mt-1 text-foreground focus-visible:outline-none rounded focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 py-1 font-owl sm:text-lg text-base opacity-90">
									Overwatch League
								</AccordionTrigger>
								<AccordionContent>Test</AccordionContent>
							</AccordionItem>
							<AccordionItem value="owcs" className="border-none  px-2 ">
								<AccordionTrigger className="mt-1 text-foreground focus-visible:outline-none rounded focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 py-1 font-owl sm:text-lg text-base opacity-90">
									OWCS
								</AccordionTrigger>
								<AccordionContent>Test</AccordionContent>
							</AccordionItem>
							<AccordionItem value="arcade" className="border-none  px-2 ">
								<AccordionTrigger className="mt-1 text-foreground focus-visible:outline-none rounded focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 py-1 font-owl sm:text-lg text-base opacity-90">
									Arcade
								</AccordionTrigger>
								<AccordionContent>Test</AccordionContent>
							</AccordionItem>
						</Accordion>
						{/* <Separator /> */}
						<SheetLinkButton text="Statistics" className="font-owl text-foreground opacity-90 px-2 sm:text-lg text-base" />
					</div>
				</div>
				<div className="flex flex-col">
					<h1 className="font-bold sm:text-2xl text-xl font-owl text-foreground">Links</h1>
					<div className="mt-2 flex flex-col gap-2 justify-center">
						<SheetLinkButton text="Help" onClick={onHelpClick} />
						<Separator />
						<SheetLinkButton text="Feedback" onClick={onFeedbackClick} />
						<Separator />
						<Popover>
							<PopoverTrigger asChild>
								<SheetLinkButton text="Contact" />
							</PopoverTrigger>
							<PopoverContent className="w-80 mr-4 sm:mr-0">
								<SocialPopoverContent />
							</PopoverContent>
						</Popover>

						<Separator />
						<SheetLinkButton text="Donate" href={DONATION_LINK} isExternal />
						<Separator />
						<SheetLinkButton text="Twitter" href={TWITTER_LINK} isExternal />
						<Separator />
						<SheetLinkButton text="Github" href={GITHUB_LINK} isExternal />
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
