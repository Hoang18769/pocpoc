import i18nConfig from "./i18nConfig.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
