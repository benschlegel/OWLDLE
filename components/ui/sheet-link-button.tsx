import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SheetLinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	text: string;
	href?: string;
	isExternal?: boolean;
}

export function SheetLinkButton({ text, href, isExternal, className, ...props }: SheetLinkButtonProps) {
	const inner = (
		<>
			<span className="flex-1 text-left group-hover:text-primary-foreground">{text}</span>
			<ChevronRight className="size-5 text-foreground group-hover:text-primary-foreground" />
		</>
	);

	const buttonClass = cn('justify-start group hover:bg-inherit *:transition-colors sm:py-3 py-1.5  h-auto', className);

	if (href) {
		return (
			<Button asChild variant={'ghost'} className={buttonClass}>
				{isExternal ? (
					<a href={href} target="_blank" rel="noopener noreferrer">
						{inner}
					</a>
				) : (
					<Link href={href}>{inner}</Link>
				)}
			</Button>
		);
	}

	return (
		<Button variant={'ghost'} className={buttonClass} {...props}>
			{inner}
		</Button>
	);
}
