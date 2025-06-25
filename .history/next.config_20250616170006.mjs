/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: ['pngdownload.io','picsum.photos','localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '80',
        pathname: '/v1/files/**',
      },
    ], 
  },
};
const { locales, defaultLocale } = require('./i18n');

export default nextConfig;