'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// biome-ignore lint/suspicious/noExplicitAny: Importing the proper type keeps causing issues between pc and mac
export function ThemeProvider({ children, ...props }: any) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
