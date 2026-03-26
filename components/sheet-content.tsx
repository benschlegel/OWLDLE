'use client';
import { TWITTER_LINK } from '@/components/game-container/nav-bar';
import { DONATION_LINK, GITHUB_LINK, SocialPopoverContent } from '@/components/landing-page/socials';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { SheetClose, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { SheetLinkButton } from '@/components/ui/sheet-link-button';
import { OWL_DATASETS_REVERSED, OWCS_DATASETS_REVERSED } from '@/data/datasets';
import { useDialogState } from '@/hooks/use-dialog-param';
import { SettingsIcon } from 'lucide-react';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PATHNAME_TO_ACCORDION: Record<string, string> = {
	'/play': 'owl',
	'/owcs': 'owcs',
	'/endless': 'endless',
};

const triggerClass =
	'mt-1 text-foreground focus-visible:outline-none rounded focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 py-1 font-owl sm:text-lg text-base opacity-90 data-[state=open]:text-primary-foreground data-[state=open]:opacity-100';

type Props = {
	setSheetOpen: (value: React.SetStateAction<boolean>) => void;
};
export default function HamburgerSheetContent({ setSheetOpen }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeOwlDataset = pathname === '/play' ? `season${searchParams.get('season') ?? '6'}` : '';
	const activeOwcsDataset = pathname === '/owcs' ? `owcs-${searchParams.get('season') ?? 's2'}` : '';
	const activeEndlessDataset =
		pathname === '/endless'
			? (searchParams.get('mode') ?? 'owcs') === 'owcs'
				? `owcs-${searchParams.get('season') ?? 's2'}`
				: `season${searchParams.get('season') ?? '6'}`
			: '';
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

	const navigateTo = useCallback(
		(href: string) => {
			setSheetOpen(false);
			router.push(href);
		},
		[router, setSheetOpen]
	);

	const defaultAccordion = PATHNAME_TO_ACCORDION[pathname] ?? '';

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
			<div className="flex flex-col gap-4 px-4 overflow-y-auto">
				<div className="flex flex-col">
					<h1 className="font-bold sm:text-2xl text-xl font-owl text-foreground">Navigation</h1>
					<div className="mt-2 flex flex-col gap-2 justify-center">
						<Accordion type="single" defaultValue={defaultAccordion} collapsible>
							<AccordionItem value="owl" className="border-none px-2">
								<AccordionTrigger className={triggerClass}>Overwatch League</AccordionTrigger>
								<AccordionContent>
									<div className="flex flex-col">
										{OWL_DATASETS_REVERSED.map((dataset) => (
											<SheetLinkButton
												key={dataset.dataset}
												text={dataset.formattedName}
												onClick={() => navigateTo(`/play?season=${dataset.dataset.slice('season'.length)}`)}
												className="font-mono font-semibold text-foreground sm:py-2.5"
												active={dataset.dataset === activeOwlDataset}
											/>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="owcs" className="border-none px-2">
								<AccordionTrigger className={triggerClass}>OWCS</AccordionTrigger>
								<AccordionContent>
									<div className="flex flex-col">
										{OWCS_DATASETS_REVERSED.map((dataset) => (
											<SheetLinkButton
												key={dataset.dataset}
												text={dataset.formattedName}
												onClick={() => navigateTo(`/owcs?season=${dataset.dataset.slice('owcs-'.length)}`)}
												className="font-mono font-semibold text-foreground sm:py-2.5"
												active={dataset.dataset === activeOwcsDataset}
											/>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="endless" className="border-none px-2">
								<AccordionTrigger className={triggerClass}>Endless Mode</AccordionTrigger>
								<AccordionContent>
									<div className="flex flex-col">
										<p className="text-xs font-owl text-muted-foreground mb-1 ml-1">Overwatch League</p>
										{OWL_DATASETS_REVERSED.map((dataset) => (
											<SheetLinkButton
												key={`endless-${dataset.dataset}`}
												text={dataset.formattedName}
												onClick={() => navigateTo(`/endless?mode=owl&season=${dataset.dataset.slice('season'.length)}`)}
												className="font-mono font-semibold text-foreground sm:py-2.5"
												active={dataset.dataset === activeEndlessDataset}
											/>
										))}
										<p className="text-xs font-owl text-muted-foreground mb-1 ml-1 mt-2">Champion Series</p>
										{OWCS_DATASETS_REVERSED.map((dataset) => (
											<SheetLinkButton
												key={`endless-${dataset.dataset}`}
												text={dataset.formattedName}
												onClick={() => navigateTo(`/endless?mode=owcs&season=${dataset.dataset.slice('owcs-'.length)}`)}
												className="font-mono font-semibold text-foreground sm:py-2.5"
												active={dataset.dataset === activeEndlessDataset}
											/>
										))}
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
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
