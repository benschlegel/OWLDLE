import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type React from 'react';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	icon?: React.ReactNode;
}

const PressableButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, onClick, icon, asChild = false, ...props }, ref) => {
	return (
		<Button
			className={cn(
				'px-4 dark:bg-primary-foreground/80 bg-primary-foreground/90 hover:bg-primary-foreground flex gap-2  py-6 transform active:scale-95 transition-transform',
				className
			)}
			onClick={onClick}>
			{children}
			{icon}
		</Button>
	);
});
PressableButton.displayName = 'PressableButton';
export { PressableButton };
