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
import { Check, Home } from 'lucide-react';
import Link from 'next/link';
import { LAST_GAME_COOKIE } from '@/proxy';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const owlValue = pathname === '/play' ? `season${searchParams.get('season') ?? '6'}` : '';
	const owcsValue = pathname === '/owcs' ? `owcs-${searchParams.get('season') ?? 's2'}` : '';

	useEffect(() => {
		if (pathname === '/play' || pathname === '/owcs') {
			const qs = searchParams.toString();
			const url = qs ? `${pathname}?${qs}` : pathname;
			document.cookie = `${LAST_GAME_COOKIE}=${encodeURIComponent(url)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
		}
	}, [pathname, searchParams]);

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
		<nav className="sticky top-0 flex items-center justify-between bg-card shadow-sm">
			{/* Left section*/}
			<div className="flex items-center">
				<Button
					asChild
					variant={'ghost'}
					className="w-full py-6 bg-secondary/50 text-foreground transition-colors rounded-none dark:hover:text-cyan-400 hover:text-cyan-500"
					style={{ clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)', marginRight: '-6px', paddingRight: '24px' }}>
					<Link href={'/'}>
						<Home className="h-5 w-5" />
					</Link>
				</Button>

				{/* Slanted nav buttons */}
				<div className="flex items-center self-stretch">
					<NavigationMenu className="self-stretch flex-none">
						<NavigationMenuList className="h-full gap-0">
							<NavSelect items={OWL_DATASETS_REVERSED} onValueChange={handleOwlSelect} value={owlValue} highlight={pathname === '/play'}>
								<span className="sm:block hidden">Overwatch League</span>
								<span className="sm:hidden block">OWL</span>
							</NavSelect>
							<NavSelect items={OWCS_DATASETS_REVERSED} onValueChange={handleOwcsSelect} value={owcsValue} highlight={pathname === '/owcs'}>
								OWCS
							</NavSelect>
						</NavigationMenuList>
					</NavigationMenu>
					<NavButton>Arcade</NavButton>
					{/* <NavButton>SHOP</NavButton>
					<NavButton>STORY</NavButton> */}
				</div>
			</div>

			<div className="absolute sm:block hidden left-1/2 -translate-x-1/2">
				<div
					className="origin-top bg-background px-1.5 scale-[115%] shadow-sm"
					style={{
						clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
					}}>
					<Button
						variant={'ghost'}
						className="group relative flex h-full items-center justify-center gap-2 bg-secondary/90 font-bold text-lg tracking-wide hover:bg-cyan-400 transition-colors px-11 "
						style={{
							clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
						}}>
						<h1
							className="sm:text-4xl text-3xl font-bold text-center w-full"
							style={{
								fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
							}}>
							<span className="text-primary-foreground">OWL</span>
							<span>DLE</span>
						</h1>
					</Button>
				</div>
			</div>

			{/* Right section */}
			<div className="flex items-center sm:block">
				<NavButton isRightSkewed>Feedback</NavButton>
				<NavButton isRightSkewed>Contact</NavButton>
				<NavButton isRightSkewed className="-mr-2 pr-6">
					Test
				</NavButton>
			</div>
		</nav>
	);
}

function NavSelect({
	children,
	highlight = false,
	items,
	onValueChange,
	value,
	isRightSkewed = false,
}: {
	children: React.ReactNode;
	highlight?: boolean;
	items: ReadonlyArray<{ dataset: string; formattedName: string }>;
	onValueChange: (value: string) => void;
	isRightSkewed?: boolean;
	value: string;
}) {
	return (
		<NavigationMenuItem className="h-full">
			<NavigationMenuTrigger
				className={cn(
					'relative uppercase rounded-none px-4 h-full text-sm flex flex-row items-center gap-2 font-semibold tracking-wide transition-colors whitespace-nowrap hover:bg-secondary!',
					'w-auto shadow-none border-none',
					'focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0',
					'[&>svg]:skew-x-12',
					highlight
						? 'bg-primary-foreground hover:bg-primary-foreground/70! data-popup-open:bg-primary-foreground data-open:bg-primary-foreground text-white hover:text-white'
						: 'bg-card text-foreground dark:hover:text-cyan-400 hover:text-cyan-500 data-popup-open:bg-secondary data-open:bg-secondary'
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
}

function NavButton({ children, highlight = false, isRightSkewed = false, className }: ButtonProps) {
	return (
		<Button
			variant={'ghost'}
			className={cn(
				`
        relative focus-visible:ring-offset-0 uppercase rounded-none px-4 py-6 text-sm font-semibold tracking-wide transition-colors
        ${highlight ? 'bg-primary-foreground hover:bg-primary-foreground hover:text-white text-white' : 'text-foreground dark:hover:text-cyan-400 hover:text-cyan-500'}
      `,
				className
			)}
			style={{ transform: `skewX(${!isRightSkewed ? '-' : ''}12deg)` }}>
			<span style={{ display: 'inline-block', transform: `skewX(${isRightSkewed ? '-' : ''}12deg)` }}>{children}</span>
		</Button>
	);
}
