/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com'],
  },
  // experimental bölümünü güncelliyoruz
  experimental: {
    // appDir artık varsayılan olduğu için kaldırıldı
    // serverActions artık varsayılan olduğu için kaldırıldı
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  }
};

module.exports = nextConfig;