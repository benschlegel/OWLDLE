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
				pathname: '/ET/flat/**',
			},
		],
		formats: ['image/avif'],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	experimental: {
		reactCompiler: true,
		// instrumentationHook: true,
	},
});
// export default MillionLint.next({
// 	rsc: true,
// })(nextConfig);
export default nextConfig;
