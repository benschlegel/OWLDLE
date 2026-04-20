import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
};
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
import { ThemeColorSync } from '@/components/theme-color-sync';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { StatsDialog } from '@/components/game-container/dialogs/stats-dialog';
import { TeamsDialog } from '@/components/game-container/dialogs/teams-dialog';
import { FeedbackDialog } from '@/components/game-container/dialogs/feedback-dialog';

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
export const DEFAULT_DESCRIPTION = 'Guess the Overwatch esports pro player through clues about their team, role and nationality. New puzzles every day';
export const OgConfig = {
	ogImagePath: `/open-graph/opengraph-image.png?type=newImg`,
	ogSquarePath: '/open-graph/opengraph-square.png',
	ogImageWidth: 1200,
	ogImageHeight: 630,
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
		canonical: '/owcs?season=s3',
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
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-snippet': -1,
		},
	},
	keywords: [
		'overwatch wordle',
		'overwatch guessing game',
		'overwatch player quiz',
		'overwatch esports quiz',
		'ow2 wordle',
		'overwatch 2 wordle',
		'daily overwatch game',
		'owldle',
		'Overwatch League',
		'OWCS',
		'Overwatch Champions Series',
		'esports wordle',
		'OWL trivia',
		'OWCS trivia',
		'ow wordle',
		'wordle overwatch',
		'overwatch esports wordle',
		'overwatch esports dle',
		'owcs dle',
		'owcsdle',
		'overwatch queue game',
	],
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
					<meta name="robots" content="max-image-preview: large" />
					<script
						type="application/ld+json"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								'@context': 'https://schema.org',
								'@type': 'WebApplication',
								name: 'OWLDLE',
								url: 'https://www.owldle.com',
								description: DEFAULT_DESCRIPTION,
								applicationCategory: 'GameApplication',
								operatingSystem: 'Web',
								image: [`https://www.owldle.com${OgConfig.ogImagePath}`, `https://www.owldle.com${OgConfig.ogSquarePath}`],
								offers: {
									'@type': 'Offer',
									price: '0',
									priceCurrency: 'USD',
								},
							}),
						}}
					/>
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
															<FeedbackDialog />
														</Suspense>
														<Suspense>
															<Navbar />
														</Suspense>
														<div className="px-2 sm:mt-8 mt-6 sm:px-4 lg:px-8 w-full flex justify-center items-start flex-1">
															<main className="w-[32rem]">{children}</main>
														</div>
														<Toaster />
														<div className="pointer-events-none flex justify-center pb-8 pt-4">{/* <Socials /> */}</div>
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
