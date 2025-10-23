/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark ALL of these as external so Vercel doesn't bundle them
      config.externals = [
        ...config.externals,
        'lighthouse', // <-- Add this back
        'puppeteer',
        'puppeteer-core',
        '@sparticuz/chromium',
      ];
    }
    return config;
  },
};

export default nextConfig;
