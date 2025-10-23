/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark ALL of these as external
      config.externals = [
        ...config.externals,
        'lighthouse', // <-- Make sure this is present
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
    }
    return config;
  },
};

export default nextConfig;
