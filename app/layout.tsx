import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import GuessContextProvider from '@/context/GuessContext';
import GameStateContextProvider from '@/context/GameStateContext';
import { GAME_CONFIG } from '@/lib/config';
import PlausibleProvider from 'next-plausible';

// Bold font https://fonts.adobe.com/fonts/atf-poster-gothic-round#fonts-section

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
});

const owlHeader = localFont({
	src: './fonts/OWLFontBold.woff',
	variable: '--font-owl-bold',
	weight: '700',
});

const title = 'OWLDLE - Guess the OWL player';
const description = 'Guess the Season 1 Overwatch League player';
const ogImagePath = '/open-graph.png';
const ogImageWidth = 1200;
const ogImageHeight = 630;

export const metadata: Metadata = {
	title: title,
	description: description,
	metadataBase: new URL(GAME_CONFIG.siteUrl),
	openGraph: {
		title: title,
		description: description,
		url: GAME_CONFIG.siteUrl,
		images: [
			{
				url: ogImagePath,
				width: ogImageWidth,
				height: ogImageHeight,
			},
		],
		type: 'website',
	},
	twitter: {
		title: title,
		description: description,
		images: [ogImagePath],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				{/* Add your own plausible config (if you want to set up analytics) */}
				<PlausibleProvider domain="map.bschlegel.com" customDomain="https://analytics.global.rwutscher.com" selfHosted={true} />
			</head>
			<body className={`${geistSans.className} ${owlHeader.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<GuessContextProvider>
						<GameStateContextProvider>{children}</GameStateContextProvider>
					</GuessContextProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
