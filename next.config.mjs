import { withPlausibleProxy } from 'next-plausible';
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
	runtimeCaching: [
		{
			urlPattern: /\/api\/.*$/i,
			handler: 'NetworkOnly', // Ensures API calls are never cached
			options: {
				cacheName: 'no-cache-api',
			},
		},
		{
			urlPattern: /^https?:\/\/vectorflags\.s3\.amazonaws\.com\/flags\/.*$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'vectorflags-cache',
				expiration: {
					maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
				},
			},
		},
		{
			urlPattern: /^https?:\/\/flagsapi\.com\/.*$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'flagsapi-cache',
				expiration: {
					maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
				},
			},
		},
		{
			urlPattern: /\/public\/.*\.(png|jpg|jpeg|svg|gif|webp|avif)$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'public-images-cache',
				expiration: {
					maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
				},
			},
		},
	],
})(
	withPlausibleProxy({ customDomain: 'https://plausible.global.bschlegel.com' })({
		images: {
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
		},
		async redirects() {
			return [
				{ source: '/', destination: '/play', permanent: true },
				{ source: '/season6', destination: '/play', permanent: true },
				{ source: '/season5', destination: '/play?season=5', permanent: true },
				{ source: '/season4', destination: '/play?season=4', permanent: true },
				{ source: '/season3', destination: '/play?season=3', permanent: true },
				{ source: '/season2', destination: '/play?season=2', permanent: true },
				{ source: '/season1', destination: '/play?season=1', permanent: true },
			];
		},
	})
);

export default nextConfig;
