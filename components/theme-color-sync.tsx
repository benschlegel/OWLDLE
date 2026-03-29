'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

export const THEME_COLORS = {
	dark: '#1a1a1e',
	light: '#ffffff',
} as const;

export function ThemeColorSync() {
	const { resolvedTheme } = useTheme();
	const metaRef = useRef<HTMLMetaElement | null>(null);

	useEffect(() => {
		let meta = metaRef.current;
		if (!meta) {
			// Remove server-rendered theme-color meta tags to prevent flashing, then manually add tags again-
			for (const el of document.querySelectorAll('meta[name="theme-color"]')) {
				el.remove();
			}

			meta = document.createElement('meta');
			meta.setAttribute('name', 'theme-color');
			document.head.appendChild(meta);
			metaRef.current = meta;
		}
		const color = THEME_COLORS[resolvedTheme as keyof typeof THEME_COLORS] ?? THEME_COLORS.light;
		meta.setAttribute('content', color);
	}, [resolvedTheme]);

	useEffect(() => {
		return () => {
			metaRef.current?.remove();
		};
	}, []);

	return null;
}
