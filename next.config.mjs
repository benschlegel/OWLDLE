// import MillionLint from '@million/lint';
import { withPlausibleProxy } from 'next-plausible';
/** @type {import('next').NextConfig} */
const nextConfig = withPlausibleProxy({ customDomain: 'https://plausible.global.bschlegel.com' })({
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
		unoptimized: true,
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	experimental: {
		reactCompiler: true,
		// instrumentationHook: true,
	},
	async redirects() {
		return [
			// Basic redirect
			{
				source: '/',
				destination: '/play',
				permanent: true,
			},
			{
				source: '/season6',
				destination: '/play',
				permanent: true,
			},
			{
				source: '/season5',
				destination: '/play?season=5',
				permanent: true,
			},
			{
				source: '/season4',
				destination: '/play?season=4',
				permanent: true,
			},
			{
				source: '/season3',
				destination: '/play?season=3',
				permanent: true,
			},
			{
				source: '/season2',
				destination: '/play?season=2',
				permanent: true,
			},
			{
				source: '/season1',
				destination: '/play?season=1',
				permanent: true,
			},
		];
	},
});
// export default MillionLint.next({
// 	rsc: true,
// })(nextConfig);
export default nextConfig;
