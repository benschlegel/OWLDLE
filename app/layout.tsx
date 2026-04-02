import type { Metadata, Viewport } from 'next';
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
import { Toaster } from '@/components/ui/toaster';
import { EvaluatedGuessProvider } from '@/context/GlobalGuessContext';
import PlausibleWrapper from '@/context/PlausibleWrapper';
import { Suspense } from 'react';
import { Navbar } from '@/components/game-container/nav-bar';
import Background from '@/components/background';
import { SettingsDialog } from '@/components/game-container/dialogs/settings-dialog';
import Socials from '@/components/landing-page/socials';
import { SerwistProvider } from './serwist-provider';
import { PWAProvider } from '@/components/pwa-provider';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { OfflineToast } from '@/components/offline-toast';
import { THEME_COLORS, ThemeColorSync } from '@/components/theme-color-sync';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { StatsDialog } from '@/components/game-container/dialogs/stats-dialog';
import { TeamsDialog } from '@/components/game-container/dialogs/teams-dialog';

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
export const DEFAULT_DESCRIPTION = 'Guess the pro overwatch player';
export const OgConfig = {
	ogImagePath: `/open-graph/opengraph-image.png?type=newImg`,
	ogImageWidth: 1200,
	ogImageHeight: 630,
};

export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
		{ media: '(prefers-color-scheme: light)', color: THEME_COLORS.dark },
	],
};

export const metadata: Metadata = {
	applicationName: DEFAULT_TITLE,
	title: DEFAULT_TITLE,
	description: DEFAULT_DESCRIPTION,
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: DEFAULT_TITLE,
	},
	formatDetection: {
		telephone: false,
	},
	metadataBase: new URL(GAME_CONFIG.siteUrl),
	alternates: {
		canonical: '/owl?season=6',
	},
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
	robots: {
		index: false,
		follow: true,
		nocache: true,
		googleBot: {
			index: true,
			follow: false,
			noimageindex: true,
			'max-video-preview': -1,
			'max-snippet': -1,
		},
	},
	keywords: ['Overwatch League', 'wordle', 'overwatch', 'guess the player', 'queue game', 'minigame', 'owcs', 'Champion Series'],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NuqsAdapter>
			<html lang="en" suppressHydrationWarning className="will-change-[clip-path]">
				<head>
					<meta name="twitter:card" content="summary_large_image" />
					{/* Blocking script: sets theme class before first paint to prevent flash */}
					<script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: needed to prevent theme flash
						dangerouslySetInnerHTML={{
							__html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})()`,
						}}
					/>
					{/* Add your own plausible config (if you want to set up analytics) */}
					<Suspense>
						<PlausibleWrapper />
					</Suspense>
				</head>
				<body className={`${geistSans.className} ${owlHeader.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
					<SerwistProvider swUrl="/serwist/sw.js">
						<PWAProvider>
							<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
								<ThemeColorSync />
								<ReactQueryProvider>
									<EvaluatedGuessProvider>
										<GuessContextProvider>
											<GameStateContextProvider>
												<DatasetContexttProvider>
													<Background />
													<>
														<Suspense>
															<SettingsDialog />
														</Suspense>
														<Suspense>
															<TeamsDialog />
														</Suspense>
														<Suspense>
															<StatsDialog />
														</Suspense>
														<Suspense>
															<Navbar />
														</Suspense>
														<div className="px-2 sm:mt-8 mt-6 sm:px-4 lg:px-8 w-full flex justify-center items-start flex-1">
															<main className="w-[32rem]">{children}</main>
														</div>
														<Toaster />
														<div className="pointer-events-none flex justify-center pb-8 pt-4">
															<Socials />
														</div>
													</>
												</DatasetContexttProvider>
												<SpeedInsights />
											</GameStateContextProvider>
										</GuessContextProvider>
									</EvaluatedGuessProvider>
								</ReactQueryProvider>
							</ThemeProvider>
							<PWAInstallPrompt />
							<OfflineToast />
						</PWAProvider>
					</SerwistProvider>
				</body>
			</html>
		</NuqsAdapter>
	);
}
