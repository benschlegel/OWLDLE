import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dices } from 'lucide-react';

export default function SearchInput() {
	return (
		<div className={'relative'}>
			<Input type="search" placeholder="Search for player..." className="pr-10" />
			<Button
				type="submit"
				variant="secondary"
				size="icon"
				className="absolute right-0 top-0 h-full w-auto rounded-l-none p-2 bg-primary-foreground/80 dark:text-secondary-foreground text-white hover:bg-primary-foreground">
				<div className="flex flex-row gap-2">
					<p className="text-lg tracking-tight">Guess</p>
					<div className="flex items-center justify-center">
						<Dices className="h-4 w-4" />
						<span className="sr-only">Search</span>
					</div>
				</div>
			</Button>
		</div>
	);
}
