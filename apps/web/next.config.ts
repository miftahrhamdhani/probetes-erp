import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@probetes/ui", "@probetes/types"],
  async redirects() {
    return [
      {
        source: "/sales-order",
        destination: "/marketing/sales-order",
        permanent: false,
      },
      {
        source: "/sales-order/:path*",
        destination: "/marketing/sales-order/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
