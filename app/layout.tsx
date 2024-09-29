import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import GuessContextProvider from '@/context/GuessContext';
import GameStateContextProvider from '@/context/GameStateContext';
import { GAME_CONFIG } from '@/lib/config';
import PlausibleProvider from 'next-plausible';
import { SpeedInsights } from '@vercel/speed-insights/next';
import DatasetContexttProvider from '@/context/DatasetContext';

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
	display: 'swap',
	adjustFontFallback: false,
	weight: '700',
});

const title = 'OWLDLE';
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
		siteName: 'owldle',
	},
	twitter: {
		title: title,
		description: description,
		site: GAME_CONFIG.siteUrl,
		siteId: 'owldle',
		images: [
			{
				url: `https://www.owldle.com${ogImagePath}`,
				width: ogImageWidth,
				height: ogImageHeight,
				type: 'website',
			},
		],
		card: 'summary_large_image',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="will-change-[clip-path]">
			<head>
				<meta name="twitter:card" content="summary_large_image" />
				{/* Add your own plausible config (if you want to set up analytics) */}
				<PlausibleProvider domain="www.owldle.com" customDomain="https://plausible.global.bschlegel.com" selfHosted={true} trackOutboundLinks />
			</head>
			<body className={`${geistSans.className} ${owlHeader.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<GuessContextProvider>
						<GameStateContextProvider>
							<DatasetContexttProvider>{children}</DatasetContexttProvider>
							<SpeedInsights />
						</GameStateContextProvider>
					</GuessContextProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
