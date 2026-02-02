/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['172.22.80.1'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3333/:path*',
      },
      {
        source: '/files/:path*',
        destination: 'http://localhost:3333/files/:path*',
      },
      {
        source: '/debug-files/:path*',
        destination: 'http://localhost:3333/debug-files/:path*',
      },
      {
        source: '/simple-debug-files/:path*',
        destination: 'http://localhost:3333/simple-debug-files/:path*',
      },
    ]
  },
}

module.exports = nextConfig
