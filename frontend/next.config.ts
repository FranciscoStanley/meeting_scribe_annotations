import type { NextConfig } from 'next';
import path from 'path';

const apiPublic =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Monorepo: inclui packages/shared no file tracing
  outputFileTracingRoot: path.join(__dirname, '..'),
  reactStrictMode: true,
  async redirects() {
    // Swagger vive no backend (:3001). Evita 404 do Next em :3000/api/docs
    return [
      {
        source: '/api/docs',
        destination: `${apiPublic}/api/docs`,
        permanent: false,
      },
      {
        source: '/api/docs/:path*',
        destination: `${apiPublic}/api/docs/:path*`,
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
