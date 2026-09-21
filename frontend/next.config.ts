import type { NextConfig } from 'next';
import path from 'path';

const apiPublic =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

const connectSrc = [
  "'self'",
  apiPublic,
  apiPublic.replace(/^http/, 'ws'),
  'http://localhost:3001',
  'ws://localhost:3001',
  'http://127.0.0.1:3001',
  'ws://127.0.0.1:3001',
].join(' ');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
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
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), display-capture=(self), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `connect-src ${connectSrc}`,
              "img-src 'self' data: blob:",
              "media-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
