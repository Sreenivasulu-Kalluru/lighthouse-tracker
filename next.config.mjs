/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is the crucial part
    // It tells Next.js not to bundle these packages
    // but to require them at runtime from node_modules
    if (isServer) {
      config.externals = [...config.externals, 'lighthouse', 'puppeteer'];
    }

    return config;
  },
};

export default nextConfig;
