'use client';

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function Navbar() {
	return (
		<nav className="sticky top-0 flex items-center justify-between bg-card shadow-sm">
			{/* Left section*/}
			<div className="flex items-center">
				<Button
					variant={'ghost'}
					className="w-full py-6 bg-secondary/50 text-foreground transition-colors rounded-none dark:hover:text-cyan-400 hover:text-cyan-500"
					style={{ clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)', marginRight: '-6px', paddingRight: '24px' }}>
					<Home className="h-5 w-5" />
				</Button>

				{/* Slanted nav buttons */}
				<div className="flex items-center">
					<NavButton>Overwatch League</NavButton>
					<NavButton highlight>OWCS</NavButton>
					<NavButton>Arcade</NavButton>
					{/* <NavButton>SHOP</NavButton>
					<NavButton>STORY</NavButton> */}
				</div>
			</div>

			<div className="absolute left-1/2 -translate-x-1/2">
				<Button
					variant={'ghost'}
					className="group relative flex h-full items-center justify-center gap-2 bg-secondary font-bold text-lg tracking-wide hover:bg-cyan-400 transition-colors"
					style={{
						width: '200px',
						clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
					}}>
					<h1
						className="sm:text-3xl text-3xl font-bold text-center w-full"
						style={{
							fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
						}}>
						<span className="text-primary-foreground">OWL</span>
						<span>DLE</span>
					</h1>
				</Button>
			</div>

			{/* Right section */}
			<div className="flex items-center gap-4" />
		</nav>
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
        relative uppercase rounded-none px-4 py-6 text-sm font-semibold tracking-wide transition-colors
        ${highlight ? 'bg-primary-foreground hover:bg-primary-foreground hover:text-white text-white' : 'text-foreground dark:hover:text-cyan-400 hover:text-cyan-500'}
      `}
			style={{
				transform: 'skewX(-14deg)',
			}}>
			<span style={{ display: 'inline-block', transform: 'skewX(14deg)' }}>{children}</span>
		</Button>
	);
}
