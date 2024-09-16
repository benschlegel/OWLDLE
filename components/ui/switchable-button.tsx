import { Button } from '@/components/ui/button';
import { PressableButton } from '@/components/ui/pressable-button';
import { cn } from '@/lib/utils';
import type React from 'react';
import { forwardRef, useState } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	switchDuration?: number;
	switchedContent?: React.ReactNode;
}

const SwitchableButton = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, switchDuration = 2000, children, switchedContent, onClick, asChild = false, ...props }, ref) => {
		const [isPressed, setIsPressed] = useState(false);

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			if (onClick) {
				onClick(e);
			}
			setIsPressed(true);
			// Reset the button state after duration
			setTimeout(() => setIsPressed(false), switchDuration);
		};
		return (
			<PressableButton className={cn('relative overflow-hidden w-full', className)} onClick={handleClick}>
				<span
					className={`absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-300 ${
						isPressed ? '-translate-y-full' : 'translate-y-0'
					}`}>
					{children}
				</span>
				<span
					className={`absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-300 ${
						isPressed ? 'translate-y-0' : 'translate-y-full'
					}`}>
					{switchedContent}
				</span>
			</PressableButton>
		);
	}
);
SwitchableButton.displayName = 'SwitchableButton';
export { SwitchableButton };
