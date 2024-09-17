import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BotMessageSquareIcon, Github, Swords, TwitterIcon } from 'lucide-react';

export default function Socials() {
	return (
		<div className="flex justify-center items-center opacity-60 mb-[0.1rem]">
			<div className="text-sm font-medium leading-none">
				Made with ❤️ by{' '}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="link" className="p-0">
							<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
								@scorer5
							</code>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80">
						<div className="grid gap-4">
							<div className="space-y-2">
								<h4 className="font-medium leading-none">My Socials</h4>
								<p className="text-sm text-muted-foreground">Check me out here</p>
							</div>
							<div className="grid gap-2">
								<div className="grid grid-cols-3 items-center gap-4">
									<div className="flex flex-row gap-1 justify-start items-center">
										<TwitterIcon className="w-[1.1rem] h-[1.1rem] mb-1" />
										<Label htmlFor="width">Twitter</Label>
									</div>
									<div className="col-span-2 h-8 rounded-md border border-input bg-background" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<div className="flex flex-row gap-1 justify-start items-center">
										<BotMessageSquareIcon className="w-[1.1rem] h-[1.1rem] mb-1" />
										<Label htmlFor="width">Discord</Label>
									</div>
									<Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<div className="flex flex-row gap-1 justify-start items-center">
										<Swords className="w-[1.1rem] h-[1.1rem] mb-1" />
										<Label htmlFor="width">Battle.net</Label>
									</div>
									<Input id="height" defaultValue="25px" className="col-span-2 h-8" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<div className="flex flex-row gap-1 justify-start items-center">
										<Github className="w-[1.1rem] h-[1.1rem] mb-1" />
										<Label htmlFor="width">Github</Label>
									</div>
									<Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
