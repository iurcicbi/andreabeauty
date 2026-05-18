/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Ottimizzazioni per navigazione veloce
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Esclude dal bundle webpack i moduli Node.js nativi usati da whatsapp-web.js
  // che non devono essere bundlati (girano solo lato server/Node.js)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // whatsapp-web.js e puppeteer devono girare come external (non bundlati)
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'whatsapp-web.js',
        'puppeteer',
        'puppeteer-core',
        '@aws-sdk/client-s3',
        'qrcode-terminal',
      ];
    }
    return config;
  },
  // CORS gestito interamente dal middleware (middleware.ts) per maggiore sicurezza
  async headers() {
    return [];
  },
};

module.exports = nextConfig;
