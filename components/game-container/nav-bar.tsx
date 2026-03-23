'use client';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { OWCS_DATASETS_REVERSED, OWL_DATASETS_REVERSED } from '@/data/datasets';
import { viewTransition } from '@/lib/view-transition';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function Navbar() {
	const router = useRouter();

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
				<div className="flex items-center">
					<NavSelect items={OWL_DATASETS_REVERSED} onValueChange={handleOwlSelect}>
						Overwatch League
					</NavSelect>
					<NavSelect items={OWCS_DATASETS_REVERSED} onValueChange={handleOwcsSelect} highlight>
						OWCS
					</NavSelect>
					<NavButton>Arcade</NavButton>
					{/* <NavButton>SHOP</NavButton>
					<NavButton>STORY</NavButton> */}
				</div>
			</div>

			<div className="absolute left-1/2 -translate-x-1/2">
				<div
					className="origin-top bg-background px-1.5 scale-[115%] shadow-sm"
					style={{
						clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
					}}>
					<Button
						variant={'ghost'}
						className="group relative flex h-full items-center justify-center gap-2 bg-secondary font-bold text-lg tracking-wide hover:bg-cyan-400 transition-colors px-11 "
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
			<div className="flex items-center gap-4" />
		</nav>
	);
}

function NavSelect({
	children,
	highlight = false,
	items,
	onValueChange,
}: {
	children: React.ReactNode;
	highlight?: boolean;
	items: ReadonlyArray<{ dataset: string; formattedName: string }>;
	onValueChange: (value: string) => void;
}) {
	return (
		<Select onValueChange={onValueChange}>
			<SelectTrigger
				className={cn(
					'relative uppercase rounded-none px-4 py-6 text-sm font-semibold tracking-wide transition-colors whitespace-nowrap bg-card',
					' hover:bg-secondary w-auto border-none shadow-none',
					'focus:ring-0 focus:ring-offset-0 focus:outline-none',
					'[&>svg]:hidden [&>span]:line-clamp-none',
					highlight
						? 'bg-primary-foreground hover:bg-primary-foreground/70 hover:text-white text-white'
						: 'text-foreground dark:hover:text-cyan-400 hover:text-cyan-500'
				)}
				style={{ transform: 'skewX(-14deg)' }}>
				<span style={{ display: 'inline-block', transform: 'skewX(14deg)' }}>{children}</span>
			</SelectTrigger>
			<SelectContent>
				{items.map((dataset) => (
					<SelectItem key={dataset.dataset} value={dataset.dataset}>
						{dataset.formattedName}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function NavButton({
	children,
	highlight = false,
}: {
	children: React.ReactNode;
	highlight?: boolean;
}) {
	return (
		<Button
			variant={'ghost'}
			className={`
        relative focus-visible:ring-offset-0 uppercase rounded-none px-4 py-6 text-sm font-semibold tracking-wide transition-colors
        ${highlight ? 'bg-primary-foreground hover:bg-primary-foreground hover:text-white text-white' : 'text-foreground dark:hover:text-cyan-400 hover:text-cyan-500'}
      `}
			style={{
				transform: 'skewX(-14deg)',
			}}>
			<span style={{ display: 'inline-block', transform: 'skewX(14deg)' }}>{children}</span>
		</Button>
	);
}
