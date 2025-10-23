/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // <-- Use => here
    if (isServer) {
      // Mark ALL of these as external
      config.externals = [
        ...config.externals,
        'lighthouse',
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
    }
    return config;
  },
};

export default nextConfig;
