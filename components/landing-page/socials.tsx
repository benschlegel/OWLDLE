import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SocialsRow, { type SocialProps } from '@/components/ui/socials-row';
import SocialsRowCopy from '@/components/ui/socials-row-copy';
import { BotMessageSquareIcon, Github, Swords, TwitterIcon } from 'lucide-react';

const socials: SocialProps[] = [
	{ socialName: 'Twitter', socialLink: 'https://x.com/scorer5_', socialValue: '@scorer5_', children: <TwitterIcon className="w-[1.1rem] h-[1.1rem] mb-1" /> },
	{
		socialName: 'Discord',
		socialLink: '',
		socialValue: 'scorer5',
		isCopyable: true,
		children: <BotMessageSquareIcon className="w-[1.1rem] h-[1.1rem] mb-1" />,
	},
	{ socialName: 'Battle.net', socialLink: '', socialValue: 'scorer5#21277', isCopyable: true, children: <Swords className="w-[1.1rem] h-[1.1rem] mb-1" /> },
	{
		socialName: 'Github',
		socialLink: 'https://github.com/benschlegel',
		socialValue: '@benschlegel',
		children: <Github className="w-[1.1rem] h-[1.1rem] mb-1" />,
	},
];

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
								{socials.map((socialEntry) =>
									socialEntry.isCopyable ? (
										<SocialsRowCopy key={socialEntry.socialName} socialValue={socialEntry.socialValue} socialName={socialEntry.socialName}>
											{socialEntry.children}
										</SocialsRowCopy>
									) : (
										<SocialsRow
											key={socialEntry.socialName}
											socialLink={socialEntry.socialLink}
											socialName={socialEntry.socialName}
											socialValue={socialEntry.socialValue}
											isCopyable={socialEntry.isCopyable}>
											{socialEntry.children}
										</SocialsRow>
									)
								)}
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
