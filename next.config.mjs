/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ['image/avif'],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
	},
	experimental: {
		instrumentationHook: true,
	},
};

export default nextConfig;
