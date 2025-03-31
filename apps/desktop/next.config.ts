import type { NextConfig } from "next";

const nextConfig = {
  output: "export",
  distDir: "dist",
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} satisfies NextConfig;

export default nextConfig;
