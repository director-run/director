import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3080",
      },
      {
        protocol: "https",
        hostname: "registry.director.run",
      },
    ],
  },
};

export default nextConfig;
