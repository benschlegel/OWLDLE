'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { PlausibleEvents } from '@/types/plausible';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { usePlausible } from 'next-plausible';
import { useCallback, useState, type PropsWithChildren } from 'react';

export type SocialProps = PropsWithChildren<{
	socialName: string;
	socialValue: string;
}>;

const copyDuration = 1500;

export default function SocialsRowCopy({ socialName, socialValue, children }: SocialProps) {
	const [isCopyActive, setIsCopyActive] = useState(false);
	const plausible = usePlausible<PlausibleEvents>();

	const handleCopy = useCallback(
		(name: string) => {
			// Handle copy
			setIsCopyActive(true);
			navigator.clipboard.writeText(socialValue);
			plausible('followSocial', { props: { social: name } });

			// Reset button state after timer
			const timer = setTimeout(() => {
				setIsCopyActive(false);
			}, copyDuration);

			// Cleanup timeout on unmount
			return () => clearTimeout(timer);
		},
		[socialValue, plausible]
	);

	return (
		<div className="grid grid-cols-3 items-center gap-4">
			<div className="flex flex-row gap-[0.28rem] justify-start items-center">
				{children}
				<Label htmlFor={`social-${socialName}`}>{socialName}</Label>
			</div>
			<div id={`social-${socialName}`} className="col-span-2 h-8 px-2 rounded-md border border-input bg-background justify-between flex items-center">
				<Button variant="link" className="p-0 h-auto rounded-sm" onClick={() => handleCopy(socialName)}>
					<code className="relative rounded  px-[0.3rem] py-[0.1rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
						{socialValue}
					</code>
				</Button>
				<Button variant="link" className="p-0 h-auto rounded-sm">
					{!isCopyActive ? (
						<CopyIcon key="copy-button" className="w-[1.15rem] h-[1.15rem] opacity-70" onClick={() => handleCopy(socialName)} />
					) : (
						<CheckIcon key="copy-button" className="w-[1.15rem] h-[1.15rem] opacity-70" />
					)}
				</Button>
			</div>
		</div>
	);
}
