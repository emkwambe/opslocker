/** @type {import("next").NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("better-sqlite3");
    return config;
  },
};
module.exports = nextConfig;