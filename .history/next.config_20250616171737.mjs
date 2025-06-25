import { locales, defaultLocale } from './src/i18n';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  i18n: {
    locales,
    defaultLocale,
  },
  images: {
    domains: ['pngdownload.io', 'picsum.photos', 'localhost'],
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

export default nextConfig;
