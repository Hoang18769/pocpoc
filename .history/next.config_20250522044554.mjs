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
