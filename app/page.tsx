import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, MoonIcon } from 'lucide-react';

export default function Home() {
	return (
		<div className="p-16 w-full h-full flex justify-center items-center">
			<main className="w-[32rem]">
				<div className="flex flex-row justify-between items-center w-full">
					<Button variant="ghost" size="icon" className="p-0">
						<InfoIcon className="h-6 w-6" />
					</Button>
					<div className="mb-3">
						<h1 className="text-4xl font-bold text-center">
							<span className="text-primary-foreground">OWL</span>
							<span className="text-primary-foreground/70">S1</span>LE
						</h1>
					</div>
					<Button variant="ghost" size="icon">
						<MoonIcon className="h-6 w-6" />
					</Button>
				</div>
				<Separator className="mb-4 mt-1" />
			</main>
		</div>
	);
}
