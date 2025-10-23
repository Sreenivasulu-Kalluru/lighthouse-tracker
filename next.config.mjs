/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Keep puppeteer and chromium external, but bundle lighthouse
      config.externals = [
        ...config.externals,
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
    }
    return config;
  },
};

export default nextConfig;
