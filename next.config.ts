/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ Ignore ESLint errors on Vercel build
  },
};

module.exports = nextConfig;
