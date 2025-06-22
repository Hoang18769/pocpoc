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
  // Thêm config này để đảm bảo tương thích
  experimental: {
    esmExternals: 'loose',
  },
  // Đảm bảo webpack config không conflict
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;