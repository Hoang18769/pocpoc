/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
    return [
      {
        source: '/home',
        destination: '/main/home',
      },
    ]
  },
};

export default nextConfig;


