'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export const THEME_COLORS = {
	dark: '#1a1a1e',
	light: '#ffffff',
} as const;

export function ThemeColorSync() {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		const color = THEME_COLORS[resolvedTheme as keyof typeof THEME_COLORS] ?? THEME_COLORS.light;
		// Update existing server-rendered theme-color meta tags in place
		const existing = document.querySelectorAll('meta[name="theme-color"]');
		for (const el of existing) {
			el.setAttribute('content', color);
		}
	}, [resolvedTheme]);

	return null;
}
