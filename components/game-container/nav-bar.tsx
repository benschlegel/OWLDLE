'use client';

import { Button } from '@/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
	DEFAULT_OWCS_DATASET_NAME,
	ENDLESS_PATHNAME,
	OWCS_DATASETS_REVERSED,
	OWCS_PATHNAME,
	OWL_DATASETS_REVERSED,
	OWL_PATHNAME,
	STATISTICS_GLOBAL_PATHNAME,
	STATISTICS_PATHNAME,
	HISTORY_PATHNAME,
} from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { cn } from '@/lib/utils';
import { Check, Home, MenuIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
// import { ALLOWED_PATHS, LAST_GAME_COOKIE } from '@/proxy';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { lazy, type ReactNode, Suspense, useCallback, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer } from '@/components/ui/drawer';
import { usePlausible } from 'next-plausible';
import { DONATION_LINK, SocialPopoverContent } from '@/components/landing-page/socials';
import { useDialogState } from '@/hooks/use-dialog-param';
import { useSettings } from '@/store/settings-store';
import { ALLOWED_PATHS, LAST_GAME_COOKIE } from '@/lib/navigation';

export const TWITTER_LINK = 'https://x.com/owldle';
export const DISCORD_LINK = 'https://discord.gg/URFyM3kg7S';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const STATISTICS_PAGES = [
	{ dataset: 'overview', formattedName: 'Statistics' },
	{ dataset: 'global', formattedName: 'Global Metrics' },
];

const skewStyle = (skewRight: boolean) => ({ transform: `skewX(${skewRight ? '' : '-'}12deg)` });

const LazySheetContent = lazy(() => import('@/components/sheet-content'));

export function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const plausible = usePlausible();
	const { setOpen: setFeedbackOpen } = useDialogState('feedback');
	const { open: helpOpen, setOpen: setHelpOpen } = useDialogState('help');
	const { open: teamsOpen, setOpen: setTeamsOpen } = useDialogState('teams');
	const preferTeams = useSettings((s) => s.preferTeamsDialog);
	const searchParams = useSearchParams();
	const { setOpen: setSettingsOpen } = useDialogState('settings');
	const [sheetOpen, setSheetOpen] = useState(false);

	const owlValue = pathname === OWL_PATHNAME ? `season${searchParams.get('season') ?? '6'}` : '';
	const owcsSeason = searchParams.get('season');
	const owcsValue = pathname === OWCS_PATHNAME ? (owcsSeason ? `owcs-${owcsSeason}` : DEFAULT_OWCS_DATASET_NAME) : '';
	const endlessMode = pathname === ENDLESS_PATHNAME ? searchParams.get('mode') ?? 'owcs' : '';
	const endlessSeason = pathname === ENDLESS_PATHNAME ? searchParams.get('season') ?? DEFAULT_OWCS_DATASET_NAME.slice('owcs-'.length) : '';

	useEffect(() => {
		if (ALLOWED_PATHS.includes(pathname)) {
			const qs = searchParams.toString();
			const url = qs ? `${pathname}?${qs}` : pathname;
			document.cookie = `${LAST_GAME_COOKIE}=${encodeURIComponent(url)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
		}
	}, [pathname, searchParams]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === 'b') {
				e.preventDefault();
				setSheetOpen((prev) => !prev);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const handleOwlSelect = useCallback(
		(value: string) => {
			const season = value.slice('season'.length);
			const target = `${OWL_PATHNAME}?season=${season}`;
			const isSamePath = pathname === OWL_PATHNAME;
			viewTransition(() => {
				if (isSamePath) {
					window.history.pushState(null, '', target);
					router.refresh();
				} else {
					router.push(target);
				}
			});
		},
		[router, pathname]
	);

	const handleOwcsSelect = useCallback(
		(value: string) => {
			const season = value.slice('owcs-'.length);
			const target = `${OWCS_PATHNAME}?season=${season}`;
			const isSamePath = pathname === OWCS_PATHNAME;
			viewTransition(() => {
				if (isSamePath) {
					window.history.pushState(null, '', target);
					router.refresh();
				} else {
					router.push(target);
				}
			});
		},
		[router, pathname]
	);

	const handleEndlessSelect = useCallback(
		(value: string | null) => {
			if (!value) return;

			const [mode, season] = value.split(':');
			if (!mode || !season) return;

			const target = `${ENDLESS_PATHNAME}?mode=${mode}&season=${season}`;
			const isSamePath = pathname === ENDLESS_PATHNAME;

			viewTransition(() => {
				if (isSamePath) {
					window.history.pushState(null, '', target);
					router.refresh();
				} else {
					router.push(target);
				}
			});
		},
		[router, pathname]
	);

	const handleStatisticsSelect = useCallback(
		(value: string) => {
			const target = value === 'global' ? STATISTICS_GLOBAL_PATHNAME : STATISTICS_PATHNAME;
			const isSamePath = pathname === target;
			viewTransition(() => {
				if (isSamePath) {
					window.history.pushState(null, '', target);
					router.refresh();
				} else {
					router.push(target);
				}
			});
		},
		[router, pathname]
	);

	return (
		<Drawer direction="right" open={sheetOpen} onOpenChange={setSheetOpen}>
			<nav className="sticky z-20 relaxed top-0 flex items-center justify-between bg-card shadow-sm">
				{/* Left section*/}
				<div className="flex items-center sm:flex-none flex-1 self-stretch">
					<NavButton href="/" className="sm:flex hidden -ml-1 px-5 bg-secondary/50">
						<Home className="h-5 w-5" />
					</NavButton>

					{/* Slanted nav buttons */}
					<div className="flex items-center self-stretch">
						<NavigationMenu className="self-stretch flex-none">
							<NavigationMenuList className="h-full gap-0">
								<NavSelect
									items={OWL_DATASETS_REVERSED}
									onValueChange={handleOwlSelect}
									value={owlValue}
									highlight={pathname === OWL_PATHNAME}
									label="Overwatch League"
									prefetchRoute={OWL_PATHNAME}
									className={'2xl:ml-0 2xl:pl-5 -ml-1.5 pl-6'}>
									{/* <span className="2xl:block hidden">Overwatch League</span>
									<span className="2xl:hidden block">OWL</span> */}
									<span>OWL</span>
								</NavSelect>
								<NavSelect
									label="Champion Series"
									items={OWCS_DATASETS_REVERSED}
									onValueChange={handleOwcsSelect}
									value={owcsValue}
									highlight={pathname === OWCS_PATHNAME}
									prefetchRoute={OWCS_PATHNAME}>
									OWCS
								</NavSelect>
								<NavSelect
									onValueChange={handleEndlessSelect}
									value={pathname === ENDLESS_PATHNAME ? `${endlessMode}:${endlessSeason}` : ''}
									highlight={pathname === ENDLESS_PATHNAME}
									showNew
									prefetchRoute={ENDLESS_PATHNAME}
									menuContent={
										<EndlessNavContent onValueChange={handleEndlessSelect} value={pathname === ENDLESS_PATHNAME ? `${endlessMode}:${endlessSeason}` : ''} />
									}>
									{/* <span className="2xl:block hidden">Endless Mode</span> */}
									{/* <span className="2xl:hidden block">Endless</span> */}
									<span className="">Endless</span>
								</NavSelect>
								<NavSelect
									items={STATISTICS_PAGES}
									onValueChange={handleStatisticsSelect}
									value={pathname === STATISTICS_GLOBAL_PATHNAME ? 'global' : pathname === STATISTICS_PATHNAME ? 'overview' : ''}
									highlight={pathname.startsWith(STATISTICS_PATHNAME)}
									prefetchRoute={STATISTICS_PATHNAME}
									className="hidden navbar-hidden:flex w-full">
									Statistics
								</NavSelect>
							</NavigationMenuList>
						</NavigationMenu>
						<NavButton href={HISTORY_PATHNAME} highlight={pathname === HISTORY_PATHNAME} className="hidden navbar-hidden:flex h-full py-0 px-4">
							History
						</NavButton>
					</div>
				</div>

				{/* Mobile hamburger menu (opens sheet)*/}
				<Button
					variant={'ghost'}
					className="py-6 flex lg:hidden bg-secondary/50 text-foreground transition-colors rounded-none dark:hover:text-cyan-400 hover:text-cyan-500"
					style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%)', marginLeft: '-6px', paddingLeft: '24px' }}
					onClick={() => setSheetOpen(true)}>
					<MenuIcon className="h-5 w-5" />
				</Button>

				{/* Center Button */}
				<div className="absolute z-10  drop-shadow-sm lg:block hidden left-1/2 -translate-x-1/2">
					<div
						className="origin-top bg-background px-1.5 scale-[115%] shadow-sm"
						style={{
							clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
						}}>
						<Button
							variant={'ghost'}
							onClick={() => (preferTeams ? setTeamsOpen(!teamsOpen) : setHelpOpen(!helpOpen))}
							className="group relative flex h-full items-center justify-center gap-2 bg-secondary/90 font-bold text-lg tracking-wide hover:bg-secondary/60 transition-colors px-11 "
							style={{
								clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
							}}>
							<h1 className="sm:text-4xl text-3xl font-bold text-center w-full font-owl">
								<span className="text-primary-foreground">OWL</span>
								<span className="text-foreground">DLE</span>
							</h1>
						</Button>
					</div>
				</div>

				{/* Right section */}
				<div className="items-center lg:flex hidden">
					<NavButton isRightSkewed href={DISCORD_LINK} isExternal className="hidden navbar-hidden:flex">
						Discord
					</NavButton>
					<NavButton isRightSkewed href={TWITTER_LINK} isExternal className="hidden navbar-hidden:flex">
						Twitter
					</NavButton>
					<NavButton isRightSkewed onClick={() => setFeedbackOpen(true)}>
						Feedback
					</NavButton>
					{/* Contact button popover */}
					<Popover>
						<PopoverTrigger asChild>
							<NavButton isRightSkewed name="Show socials" onClick={() => plausible('openSocials')}>
								Contact
							</NavButton>
						</PopoverTrigger>
						<PopoverContent className="w-80 mr-4 sm:mr-0">
							<SocialPopoverContent />
						</PopoverContent>
					</Popover>
					<NavButton isRightSkewed href={DONATION_LINK} isExternal>
						Donate
					</NavButton>

					{/* Sidebar button */}
					<NavButton isRightSkewed className="-mr-2 pr-6 hidden navbar-hidden:flex" onClick={() => setSheetOpen(true)}>
						<MenuIcon className="size-5" />
					</NavButton>

					{/* desktop overflow hamburger menu */}
					<NavButton isRightSkewed className="-mr-2 pr-6 flex navbar-hidden:hidden" onClick={() => setSheetOpen(true)}>
						<MenuIcon className="size-5" />
					</NavButton>
				</div>
			</nav>
			<Suspense>
				<LazySheetContent setSheetOpen={setSheetOpen} />
			</Suspense>
		</Drawer>
	);
}

function NavSelect({
	children,
	highlight = false,
	items,
	onValueChange,
	value,
	isRightSkewed = false,
	className,
	menuContent,
	label,
	prefetchRoute,
	showNew = false,
}: {
	children: React.ReactNode;
	label?: string;
	highlight?: boolean;
	items?: ReadonlyArray<{ dataset: string; formattedName: string }>;
	onValueChange: (value: string) => void;
	isRightSkewed?: boolean;
	value: string;
	className?: string;
	menuContent?: ReactNode;
	prefetchRoute?: string;
	showNew?: boolean;
}) {
	const router = useRouter();
	return (
		<NavigationMenuItem className="h-full">
			<NavigationMenuTrigger
				className={cn(
					'relative uppercase rounded-none px-4 h-full text-sm flex flex-row items-center gap-2 font-semibold tracking-wide font-owl transition-colors whitespace-nowrap hover:bg-secondary!',
					'w-auto shadow-none border-none gap-1',
					'focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0',
					'[&>svg]:skew-x-12',
					highlight
						? 'bg-primary-foreground hover:bg-primary-foreground/80! data-popup-open:bg-primary-foreground data-open:bg-primary-foreground text-white hover:text-white focus:bg-primary-foreground'
						: 'bg-card text-foreground dark:hover:text-cyan-400 hover:text-cyan-500 focus:bg-card data-popup-open:bg-secondary data-open:bg-secondary',
					className
				)}
				onPointerEnter={() => {
					if (prefetchRoute) router.prefetch(prefetchRoute);
				}}
				style={{ transform: `skewX(${!isRightSkewed ? '-' : ''}12deg)` }}>
				<span className="relative" style={{ display: 'inline-block', transform: `skewX(${isRightSkewed ? '-' : ''}12deg)` }}>
					{children}
					{showNew && <span className="absolute -top-2.5 -right-3 text-[9px] font-bold text-primary-foreground leading-none tracking-normal">New</span>}
				</span>
			</NavigationMenuTrigger>
			{menuContent ? (
				<NavigationMenuContent>{menuContent}</NavigationMenuContent>
			) : (
				<NavigationMenuContent>
					<div className="flex flex-col gap-0 items-center">
						{label && <h1 className={cn('font-owl text-foreground text-sm mt-1.5', highlight && 'text-primary-foreground')}>{label}</h1>}
						<ul className="flex flex-col w-48 p-1">
							{items?.map((dataset) => (
								<li key={dataset.dataset}>
									<NavigationMenuLink
										closeOnClick
										onClick={() => onValueChange(dataset.dataset)}
										className={cn(
											'cursor-pointer relative py-1.5 pl-8 pr-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none font-semibold font-mono',
											value === dataset.dataset && 'font-semibold text-primary-foreground font-mono'
										)}>
										{value === dataset.dataset && (
											<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
												<Check className="h-4 w-4" />
											</span>
										)}
										<span className="opacity-75">{dataset.formattedName}</span>
									</NavigationMenuLink>
								</li>
							))}
						</ul>
					</div>
				</NavigationMenuContent>
			)}
		</NavigationMenuItem>
	);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	highlight?: boolean;
	isRightSkewed?: boolean;
	href?: string;
	isExternal?: boolean;
	showNew?: boolean;
}

function NavButton({ children, highlight = false, isRightSkewed = false, className, href, isExternal: external, showNew = false, ...props }: ButtonProps) {
	const buttonClass = cn(
		`relative focus-visible:ring-offset-0 uppercase rounded-none px-4 py-6 text-sm font-semibold tracking-wide transition-colors font-owl
        ${highlight ? 'bg-primary-foreground hover:bg-primary-foreground hover:text-white text-white' : 'text-foreground dark:hover:text-cyan-400 hover:text-cyan-500'}`,
		className
	);
	const inner = (
		<span className="relative" style={{ display: 'inline-block', transform: `skewX(${isRightSkewed ? '-' : ''}12deg)` }}>
			{children}
			{showNew && <span className="absolute -top-2.5 -right-3 text-[9px] font-bold text-primary-foreground leading-none tracking-normal">New</span>}
		</span>
	);

	if (href) {
		return (
			<Button asChild variant={'ghost'} className={buttonClass} style={{ transform: `skewX(${!isRightSkewed ? '-' : ''}12deg)` }}>
				{external ? (
					<a href={href} target="_blank" rel="noopener noreferrer" {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
						{inner}
					</a>
				) : (
					<Link href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
						{inner}
					</Link>
				)}
			</Button>
		);
	}

	return (
		<Button variant={'ghost'} className={buttonClass} style={{ transform: `skewX(${!isRightSkewed ? '-' : ''}12deg)` }} {...props}>
			{inner}
		</Button>
	);
}

type EndlessProps = {
	onValueChange?: (value: string) => void;
	value: string;
};

/** Converts a dataset identifier to the "league:season" format used by endless URL params */
function toEndlessValue(dataset: string): string {
	if (dataset.startsWith('owcs-')) return `owcs:${dataset.slice('owcs-'.length)}`;
	return `owl:${dataset.slice('season'.length)}`;
}

function EndlessNavContent({ onValueChange, value }: EndlessProps) {
	return (
		<div className="flex flex-row mt-1.5">
			<div className="flex flex-col gap-0 items-center">
				<h1 className="font-owl text-foreground text-sm">Overwatch League</h1>
				<ul className="flex flex-col w-44 p-1">
					{OWL_DATASETS_REVERSED?.map((dataset) => {
						const ev = toEndlessValue(dataset.dataset);
						return (
							<li key={dataset.dataset}>
								<NavigationMenuLink
									closeOnClick
									onClick={() => onValueChange?.(ev)}
									className={cn(
										'cursor-pointer relative py-1.5 pl-8 pr-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none font-semibold font-mono',
										value === ev && 'font-semibold text-primary-foreground font-mono'
									)}>
									{value === ev && (
										<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
											<Check className="h-4 w-4" />
										</span>
									)}
									<span className="opacity-75">{dataset.formattedName}</span>
								</NavigationMenuLink>
							</li>
						);
					})}
				</ul>
			</div>
			<div className="flex flex-col gap-0 items-center">
				<h1 className="font-owl text-foreground text-sm">Champion Series</h1>
				<ul className="flex flex-col w-44 p-1">
					{OWCS_DATASETS_REVERSED?.map((dataset) => {
						const ev = toEndlessValue(dataset.dataset);
						return (
							<li key={dataset.dataset}>
								<NavigationMenuLink
									closeOnClick
									onClick={() => onValueChange?.(ev)}
									className={cn(
										'cursor-pointer relative py-1.5 pl-8 pr-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none font-semibold font-mono',
										value === ev && 'font-semibold text-primary-foreground font-mono'
									)}>
									{value === ev && (
										<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
											<Check className="h-4 w-4" />
										</span>
									)}
									<span className="opacity-75">{dataset.formattedName}</span>
								</NavigationMenuLink>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
