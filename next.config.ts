import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  eslint: {
    // 🚫 Skip ESLint checks during `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
