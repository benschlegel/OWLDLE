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
import ReactQueryProvider from '@/context/ReactQueryProvider';
import React from 'react';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { Toaster } from '@/components/ui/toaster';

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

export const DEFAULT_TITLE = 'OWLDLE';
export const DEFAULT_DESCRIPTION = 'Guess the Overwatch League player';
export const OgConfig = {
	ogImagePath: '/opengraph-image.png?new=true',
	ogImageWidth: 1200,
	ogImageHeight: 630,
};

export const metadata: Metadata = {
	title: DEFAULT_TITLE,
	description: DEFAULT_DESCRIPTION,
	metadataBase: new URL(GAME_CONFIG.siteUrl),
	openGraph: {
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		url: GAME_CONFIG.siteUrl,
		images: [
			{
				url: OgConfig.ogImagePath,
				alt: DEFAULT_TITLE,
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
		type: 'website',
		siteName: 'owldle',
	},
	twitter: {
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		site: GAME_CONFIG.siteUrl,
		siteId: 'owldle',
		images: [
			{
				url: `https://www.owldle.com${OgConfig.ogImagePath}`,
				alt: DEFAULT_TITLE,
				width: OgConfig.ogImageWidth,
				height: OgConfig.ogImageHeight,
				type: 'image/png',
			},
		],
		card: 'summary_large_image',
	},
	keywords: ['Overwatch League', 'wordle', 'overwatch', 'guess the player', 'queue game', 'minigame'],
};

const MemoizedHeader = React.memo(Header);
const MemoizedSocials = React.memo(Socials);

export default function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: { dataset?: string[] };
}>) {
	const { dataset } = params;
	const rootSlug = dataset ? dataset[0] : '/';
	return (
		<html lang="en" suppressHydrationWarning className="will-change-[clip-path]">
			<head>
				<meta name="twitter:card" content="summary_large_image" />
				{/* Add your own plausible config (if you want to set up analytics) */}
				<PlausibleProvider domain="www.owldle.com" customDomain="https://plausible.global.bschlegel.com" selfHosted={true} trackOutboundLinks />
			</head>
			<body className={`${geistSans.className} ${owlHeader.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ReactQueryProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<GuessContextProvider>
							<GameStateContextProvider>
								<DatasetContexttProvider>
									<>
										<div className="px-2 pt-8 sm:px-4 lg:px-8 w-full h-full flex justify-center items-center">
											<main className="w-[32rem]">
												<MemoizedSocials />
												<MemoizedHeader slug={rootSlug} />
												{children}
											</main>
										</div>
										<Toaster />
									</>
								</DatasetContexttProvider>
								<SpeedInsights />
							</GameStateContextProvider>
						</GuessContextProvider>
					</ThemeProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
