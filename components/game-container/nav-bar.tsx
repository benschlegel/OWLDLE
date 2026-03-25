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
import { OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { cn } from '@/lib/utils';
import { Check, Home, MenuIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { LAST_GAME_COOKIE } from '@/proxy';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { lazy, useCallback, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet } from '@/components/ui/sheet';
import { usePlausible } from 'next-plausible';
import { DONATION_LINK, SocialPopoverContent } from '@/components/landing-page/socials';
import { useDialogState } from '@/hooks/use-dialog-param';

export const TWITTER_LINK = 'https://x.com/owldle';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const skewStyle = (skewRight: boolean) => ({ transform: `skewX(${skewRight ? '' : '-'}12deg)` });

const LazySheetContent = lazy(() => import('@/components/sheet-content'));

export function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const plausible = usePlausible();
	const { setOpen: setFeedbackOpen } = useDialogState('feedback');
	const { setOpen: setHelpOpen } = useDialogState('help');
	const searchParams = useSearchParams();
	const { setOpen: setSettingsOpen } = useDialogState('settings');
	const [sheetOpen, setSheetOpen] = useState(false);

	const owlValue = pathname === '/play' ? `season${searchParams.get('season') ?? '6'}` : '';
	const owcsValue = pathname === '/owcs' ? `owcs-${searchParams.get('season') ?? 's2'}` : '';

	useEffect(() => {
		if (pathname === '/play' || pathname === '/owcs') {
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
			viewTransition(() => router.push(`/play?season=${season}`));
		},
		[router]
	);

	const handleOwcsSelect = useCallback(
		(value: string) => {
			const season = value.slice('owcs-'.length);
			viewTransition(() => router.push(`/owcs?season=${season}`));
		},
		[router]
	);

	return (
		<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
			<nav className="sm:sticky z-20 relaxed top-0 flex items-center justify-between bg-card shadow-sm">
				{/* Left section*/}
				<div className="flex items-center sm:flex-none flex-1">
					<Button
						asChild
						variant={'ghost'}
						className="w-full sm:flex hidden py-6 bg-secondary/50 text-foreground transition-colors rounded-none dark:hover:text-cyan-400 hover:text-cyan-500"
						style={{ clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)', marginRight: '-7px', paddingRight: '24px' }}>
						<Link href={'/'}>
							<Home className="h-5 w-5" />
						</Link>
					</Button>

					{/* Slanted nav buttons */}
					<div className="flex items-center self-stretch">
						<NavigationMenu className="self-stretch flex-none">
							<NavigationMenuList className="h-full gap-0">
								<NavSelect
									items={OWL_DATASETS_REVERSED}
									onValueChange={handleOwlSelect}
									value={owlValue}
									highlight={pathname === '/play'}
									className={'2xl:ml-0 2xl:pl-5 -ml-1 pl-6'}>
									<span className="2xl:block hidden">Overwatch League</span>
									<span className="2xl:hidden block">OWL</span>
								</NavSelect>
								<NavSelect items={OWCS_DATASETS_REVERSED} onValueChange={handleOwcsSelect} value={owcsValue} highlight={pathname === '/owcs'}>
									OWCS
								</NavSelect>
							</NavigationMenuList>
						</NavigationMenu>
						<NavButton>Arcade</NavButton>
						<NavButton className="hidden navbar-hidden:flex">Statistics</NavButton>
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
							onClick={() => setHelpOpen(true)}
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

					<NavButton isRightSkewed href={TWITTER_LINK} isExternal className="hidden navbar-hidden:flex">
						Twitter
					</NavButton>
					<NavButton isRightSkewed className="-mr-2 pr-6 hidden navbar-hidden:flex" onClick={() => setSettingsOpen(true)}>
						<SettingsIcon className="size-5" />
					</NavButton>
					{/* desktop overflow hamburger menu */}
					<NavButton isRightSkewed className="-mr-2 pr-6 flex navbar-hidden:hidden" onClick={() => setSheetOpen(true)}>
						<MenuIcon className="size-5" />
					</NavButton>
				</div>
			</nav>
			<LazySheetContent setSheetOpen={setSheetOpen} />
		</Sheet>
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
}: {
	children: React.ReactNode;
	highlight?: boolean;
	items: ReadonlyArray<{ dataset: string; formattedName: string }>;
	onValueChange: (value: string) => void;
	isRightSkewed?: boolean;
	value: string;
	className?: string;
}) {
	return (
		<NavigationMenuItem className="h-full">
			<NavigationMenuTrigger
				className={cn(
					'relative uppercase rounded-none px-4 h-full text-sm flex flex-row items-center gap-2 font-semibold tracking-wide font-owl transition-colors whitespace-nowrap hover:bg-secondary!',
					'w-auto shadow-none border-none',
					'focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0',
					'[&>svg]:skew-x-12',
					highlight
						? 'bg-primary-foreground hover:bg-primary-foreground/80! data-popup-open:bg-primary-foreground data-open:bg-primary-foreground text-white hover:text-white focus:bg-primary-foreground'
						: 'bg-card text-foreground dark:hover:text-cyan-400 hover:text-cyan-500 focus:bg-card data-popup-open:bg-secondary data-open:bg-secondary',
					className
				)}
				style={{ transform: `skewX(${!isRightSkewed ? '-' : ''}12deg)` }}>
				<span style={{ display: 'inline-block', transform: `skewX(${isRightSkewed ? '-' : ''}12deg)` }}>{children}</span>
			</NavigationMenuTrigger>
			<NavigationMenuContent>
				<ul className="flex flex-col w-48 p-1">
					{items.map((dataset) => (
						<li key={dataset.dataset}>
							<NavigationMenuLink
								onClick={() => onValueChange(dataset.dataset)}
								className={cn(
									'cursor-pointer relative py-1.5 pl-8 pr-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none',
									value === dataset.dataset && 'font-medium'
								)}>
								{value === dataset.dataset && (
									<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
										<Check className="h-4 w-4" />
									</span>
								)}
								{dataset.formattedName}
							</NavigationMenuLink>
						</li>
					))}
				</ul>
			</NavigationMenuContent>
		</NavigationMenuItem>
	);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	highlight?: boolean;
	isRightSkewed?: boolean;
	href?: string;
	isExternal?: boolean;
}

function NavButton({ children, highlight = false, isRightSkewed = false, className, href, isExternal: external, ...props }: ButtonProps) {
	const buttonClass = cn(
		`relative focus-visible:ring-offset-0 uppercase rounded-none px-4 py-6 text-sm font-semibold tracking-wide transition-colors font-owl
        ${highlight ? 'bg-primary-foreground hover:bg-primary-foreground hover:text-white text-white' : 'text-foreground dark:hover:text-cyan-400 hover:text-cyan-500'}`,
		className
	);
	const inner = <span style={{ display: 'inline-block', transform: `skewX(${isRightSkewed ? '-' : ''}12deg)` }}>{children}</span>;

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
