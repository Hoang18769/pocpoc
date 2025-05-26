/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
    return [
      {
        source: '/:prop',
        destination: '/main/:prop',
      },
    ]
  },
};

export default nextConfig;


