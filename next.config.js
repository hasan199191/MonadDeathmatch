/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com'],
  },
  // Harici hostname'lere izin ver
  experimental: {
    externalDir: true,
  },
  // Ngrok için güvenli bir şekilde izin ver
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https:;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
