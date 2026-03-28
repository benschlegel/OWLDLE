// import MillionLint from '@million/lint';
import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';
import { withPlausibleProxy } from 'next-plausible';

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
			// Legacy /play → /owl
			{
				source: '/play',
				destination: '/owl',
				permanent: true,
			},
			// Legacy /seasonN routes
			{
				source: '/season6',
				destination: '/owl',
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
			// Pretty OWL URLs: /owl/season1 -> /owl?season=1
			{
				source: '/owl/season:num',
				destination: '/owl?season=:num',
				permanent: false,
			},
			// Pretty OWCS URLs: /owcs/seasonN → /owcs?season=sN
			{
				source: '/owcs/season1',
				destination: '/owcs?season=s1',
				permanent: false,
			},
			{
				source: '/owcs/season2',
				destination: '/owcs?season=s2',
				permanent: false,
			},
			{
				source: '/owcs/season3',
				destination: '/owcs?season=s3',
				permanent: false,
			},
		];
	},
});
// export default MillionLint.next({
// 	rsc: true,
// })(nextConfig);
export default withSerwist(nextConfig);
