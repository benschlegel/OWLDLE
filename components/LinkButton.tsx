import { EnhancedButton } from '@/components/ui/enhanced.button';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';

type Props = {
	href: string;
	isInternal?: boolean;
};

const className: React.ComponentProps<'a'>['className'] =
	'text-base tracking-normal rounded-lg px-[0.1rem] py-[0.1rem] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-foreground focus-visible:ring-offset-1';

export default function LinkButton({ children, href, isInternal }: PropsWithChildren<Props>) {
	return (
		<EnhancedButton variant={'linkHover1'} tabIndex={-1}>
			{isInternal ? (
				<Link href={href} className={className}>
					{children}
				</Link>
			) : (
				<a href={href} className={className} target="_blank" rel="noreferrer">
					{children}
				</a>
			)}
		</EnhancedButton>
	);
}
