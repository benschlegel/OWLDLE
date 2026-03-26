import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export function useMobileTooltip() {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLElement>(null);
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const didScrollRef = useRef(false);

	// Close tooltip on outside touch or any scroll (including inside ScrollArea)
	useEffect(() => {
		if (!open) return;

		const handleTouchOutside = (e: TouchEvent) => {
			if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		const handleScroll = () => setOpen(false);

		document.addEventListener('touchstart', handleTouchOutside);
		document.addEventListener('scroll', handleScroll, true);
		return () => {
			document.removeEventListener('touchstart', handleTouchOutside);
			document.removeEventListener('scroll', handleScroll, true);
		};
	}, [open]);

	const touchHandlers = {
		onTouchStart: (e: React.TouchEvent) => {
			const touch = e.touches[0];
			touchStartRef.current = { x: touch.clientX, y: touch.clientY };
			didScrollRef.current = false;
		},
		onTouchMove: (e: React.TouchEvent) => {
			if (!touchStartRef.current) return;
			const touch = e.touches[0];
			if (Math.abs(touch.clientX - touchStartRef.current.x) > 10 || Math.abs(touch.clientY - touchStartRef.current.y) > 10) {
				didScrollRef.current = true;
			}
		},
		onTouchEnd: (e: React.TouchEvent) => {
			e.preventDefault();
			if (!didScrollRef.current) {
				setOpen((prev) => !prev);
			}
		},
	};

	return { open, setOpen, triggerRef, touchHandlers };
}
