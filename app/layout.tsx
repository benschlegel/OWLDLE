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
import { Toaster } from '@/components/ui/toaster';
import { EvaluatedGuessProvider } from '@/context/GlobalGuessContext';
import PlausibleWrapper from '@/context/PlausibleWrapper';
import { Suspense } from 'react';

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
	alternates: {
		canonical: '/play',
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
	keywords: ['Overwatch League', 'wordle', 'overwatch', 'guess the player', 'queue game', 'minigame'],
};

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ dataset?: string[] }>;
}>) {
	const { dataset } = await params;
	return (
		<html lang="en" suppressHydrationWarning className="will-change-[clip-path]">
			<head>
				<meta name="twitter:card" content="summary_large_image" />
				{/* Add your own plausible config (if you want to set up analytics) */}
				<Suspense>
					<PlausibleWrapper />
				</Suspense>
			</head>
			<body className={`${geistSans.className} ${owlHeader.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<ReactQueryProvider>
						<EvaluatedGuessProvider>
							<GuessContextProvider>
								<GameStateContextProvider>
									<DatasetContexttProvider>
										<>
											<div className="px-2 pt-8 sm:px-4 lg:px-8 w-full h-full flex justify-center items-center">
												<main className="w-[32rem]">{children}</main>
											</div>
											<Toaster />
										</>
									</DatasetContexttProvider>
									<SpeedInsights />
								</GameStateContextProvider>
							</GuessContextProvider>
						</EvaluatedGuessProvider>
					</ReactQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
