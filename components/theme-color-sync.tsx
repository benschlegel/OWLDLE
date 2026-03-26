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
		// Remove any existing theme-color meta tags (from viewport export)
		const existing = document.querySelectorAll('meta[name="theme-color"]');
		for (const el of existing) el.remove();
		// Insert a single meta tag with the resolved color
		const meta = document.createElement('meta');
		meta.name = 'theme-color';
		meta.content = color;
		document.head.appendChild(meta);
	}, [resolvedTheme]);

	return null;
}
