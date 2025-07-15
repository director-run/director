import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  transpilePackages: ["@director.run/design", "@director.run/utilities"],
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
        source: "/install.sh",
        destination:
          "https://raw.githubusercontent.com/director-run/director/refs/heads/main/scripts/install.sh",
      },
    ]);
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
