import Game from '@/components/landing-page/game';
import { ModeToggle } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CircleHelpIcon } from 'lucide-react';

export default function Header() {
	return (
		<>
			<div className="flex flex-row justify-between items-center w-full">
				<Button variant="ghost" size="icon" className="p-0">
					<CircleHelpIcon className="h-[1.3rem] w-[1.3rem] transition-all" />
				</Button>
				<div className="mb-3">
					<h1 className="text-4xl font-bold text-center">
						<span className="text-primary-foreground">OWL</span>
						<span className="text-primary-foreground/70">S1</span>LE
					</h1>
				</div>
				<ModeToggle />
			</div>
			<Separator className="mb-6 mt-1" />
			<Game />
		</>
	);
}
