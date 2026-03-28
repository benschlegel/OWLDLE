'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export const THEME_COLORS = {
	dark: '#1a1a1e',
	light: '#ffffff',
} as const;

function applyThemeColor(theme: string | undefined) {
	const color = THEME_COLORS[theme as keyof typeof THEME_COLORS] ?? THEME_COLORS.light;
	const existing = document.querySelectorAll('meta[name="theme-color"]');
	for (const el of existing) {
		el.setAttribute('content', color);
	}
}

export function ThemeColorSync() {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		applyThemeColor(resolvedTheme);

		// Re-apply after Next.js re-renders <head> during navigation
		const observer = new MutationObserver(() => applyThemeColor(resolvedTheme));
		observer.observe(document.head, { childList: true });
		return () => observer.disconnect();
	}, [resolvedTheme]);

	return null;
}
