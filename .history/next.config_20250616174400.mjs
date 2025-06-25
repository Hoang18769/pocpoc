import i18nConfig from "./";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
