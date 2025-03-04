'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import SocialsRow, { type SocialProps } from '@/components/ui/socials-row';
import SocialsRowCopy from '@/components/ui/socials-row-copy';
import type { PlausibleEvents } from '@/types/plausible';
import { BotMessageSquareIcon, CoffeeIcon, Github, TwitterIcon } from 'lucide-react';
import { usePlausible } from 'next-plausible';
import Link from 'next/link';

const socials: SocialProps[] = [
	{
		socialName: 'Twitter',
		socialLink: 'https://x.com/scorer5_',
		socialValue: '@scorer5_',
		children: <TwitterIcon className="w-[1.1rem] h-[1.1rem] mb-[0.1rem]" />,
	},
	{
		socialName: 'Discord',
		socialLink: '',
		socialValue: 'scorer5',
		isCopyable: true,
		children: <BotMessageSquareIcon className="w-[1.1rem] h-[1.1rem] mb-1" />,
	},
	// { socialName: 'Battle.net', socialLink: '', socialValue: 'scorer5#21277', isCopyable: true, children: <Swords className="w-[1.1rem] h-[1.1rem] mb-1" /> },
	{
		socialName: 'Ko-fi',
		socialLink: 'https://ko-fi.com/scorer5',
		socialValue: 'scorer5',
		children: <CoffeeIcon className="w-[1.1rem] h-[1.1rem] mb-[0.1rem]" />,
	},
	{
		socialName: 'Github',
		socialLink: 'https://github.com/benschlegel',
		socialValue: '@benschlegel',
		children: <Github className="w-[1.1rem] h-[1.1rem] mb-1" />,
	},
];

const projectGithubLink = 'https://github.com/benschlegel/OWLDLE';

export default function Socials() {
	const plausible = usePlausible<PlausibleEvents>();
	return (
		<div className="flex justify-center items-center opacity-60 sm:ml-[0.75rem]">
			<div className="text-sm font-medium leading-none">
				Made with ❤️ by{' '}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="link" className="p-0 h-auto transition-colors duration-200" name="Show socials" onClick={() => plausible('openSocials')}>
							<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
								@scorer5
							</code>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 mr-4 sm:mr-0">
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
							<Separator />
							<div className="text-sm text-muted-foreground">
								You can also find this project on{' '}
								<Link target="_blank" href={projectGithubLink} rel="noopener noreferrer" className="border-md">
									<Button variant="link" className="p-0 h-auto" tabIndex={-1} aria-label="View on Github">
										<code
											className="relative rounded bg-background px-[0.3rem] py-[0.2rem] text-sm font-semibold"
											style={{ fontFamily: 'var(--font-geist-mono)' }}>
											Github
										</code>
									</Button>
								</Link>
								!
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
