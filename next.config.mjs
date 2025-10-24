/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Keep puppeteer external, BUT BUNDLE lighthouse
      config.externals = [
        ...config.externals,
        // REMOVE 'lighthouse' from this list
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
    }
    return config;
  },
};

export default nextConfig;
