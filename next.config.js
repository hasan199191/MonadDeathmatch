/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com'],
  },
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_MONAD_RPC_URL: process.env.NEXT_PUBLIC_MONAD_RPC_URL,
    NEXT_PUBLIC_MONAD_CHAIN_ID: process.env.NEXT_PUBLIC_MONAD_CHAIN_ID,
  },
  // Harici hostname'lere izin ver
  experimental: {
    externalDir: true,
  },
  // Ngrok için güvenli bir şekilde izin ver
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }
        ],
      },
    ];
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'websocket'];
    return config;
  },
};

module.exports = nextConfig;