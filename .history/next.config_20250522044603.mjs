/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/home',
        destination: '/main/home',
      },
    ]
  },
}

module.exports = nextConfig

