/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
    return [
      {
        source: '/::prop',
        destination: '/main/home',
      },
    ]
  },
};

export default nextConfig;


