'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CopyIcon } from 'lucide-react';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';

export type SocialProps = PropsWithChildren<{
	socialName: string;
	socialValue: string;
}>;
export default function SocialsRowCopy({ socialName, socialValue, children }: SocialProps) {
	return (
		<div className="grid grid-cols-3 items-center gap-4">
			<div className="flex flex-row gap-[0.28rem] justify-start items-center">
				{children}
				<Label htmlFor={`social-${socialName}`}>{socialName}</Label>
			</div>
			<div id={`social-${socialName}`} className="col-span-2 h-8 px-2 rounded-md border border-input bg-background justify-between flex items-center">
				<Button
					variant="link"
					className="p-0 h-auto rounded-sm"
					onClick={() => {
						console.log('Clicked!');
					}}>
					<code className="relative rounded  px-[0.3rem] py-[0.1rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
						{socialValue}
					</code>
				</Button>
				<Button variant="link" className="p-0 h-auto rounded-sm">
					<CopyIcon className="w-[1.15rem] h-[1.15rem] opacity-70" />
				</Button>
			</div>
		</div>
	);
}
