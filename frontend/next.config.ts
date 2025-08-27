/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-backend-domain.vercel.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;