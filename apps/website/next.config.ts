import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  rewrites: () => {
    return Promise.resolve([
      {
        source: "/install",
        destination:
          "https://raw.githubusercontent.com/director-run/director/refs/heads/main/scripts/install.sh",
      },
    ]);
  },
};

export default nextConfig;
