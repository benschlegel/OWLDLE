import MillionLint from '@million/lint';
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false
  },
  experimental: {
    reactCompiler: true,
    instrumentationHook: true
  }
};
export default MillionLint.next({
  rsc: true
})(nextConfig);