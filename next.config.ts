// import MillionLint from '@million/lint';
import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';
import { withPlausibleProxy } from 'next-plausible';

export const TWITTER_LINK = 'https://x.com/owldle';
export const DISCORD_LINK = 'https://discord.gg/URFyM3kg7S';

const nextConfig: NextConfig = withPlausibleProxy({ customDomain: 'https://plausible.global.bschlegel.com' })({
	images: {
		// TODO: remove to disable nextjs image optimizations/caching
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'vectorflags.s3.amazonaws.com',
				port: '',
				pathname: '/flags/**',
			},
			{
				protocol: 'https',
				hostname: 'flagsapi.com',
				port: '',
				pathname: '/**',
			},
		],
		formats: ['image/avif'],
		qualities: [100, 75],
		unoptimized: true,
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	reactCompiler: true,
	experimental: {
		viewTransition: true,
	},
	allowedDevOrigins: ['dev.bschlegel.com'],
	async redirects() {
		return [
			{
				source: '/play',
				destination: '/owl',
				permanent: true,
			},
			{
				source: '/season6',
				destination: '/owl?season=6',
				permanent: true,
			},
			{
				source: '/season5',
				destination: '/owl?season=5',
				permanent: true,
			},
			{
				source: '/season4',
				destination: '/owl?season=4',
				permanent: true,
			},
			{
				source: '/season3',
				destination: '/owl?season=3',
				permanent: true,
			},
			{
				source: '/season2',
				destination: '/owl?season=2',
				permanent: true,
			},
			{
				source: '/season1',
				destination: '/owl?season=1',
				permanent: true,
			},

			// Socials links
			{
				source: '/discord',
				destination: DISCORD_LINK,
				permanent: true,
			},
			{
				source: '/twitter',
				destination: TWITTER_LINK,
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			// Pretty OWL URLs: /owl/season1 -> /owl?season=1
			{
				source: '/owl/season:num',
				destination: '/owl?season=:num',
			},
			// Pretty OWCS URLs: /owcs/seasonN → /owcs?season=sN
			{
				source: '/owcs/season1',
				destination: '/owcs?season=s1',
			},
			{
				source: '/owcs/season2',
				destination: '/owcs?season=s2',
			},
			{
				source: '/owcs/season3',
				destination: '/owcs?season=s3',
			},
		];
	},
});
// export default MillionLint.next({
// 	rsc: true,
// })(nextConfig);
export default withSerwist(nextConfig);
