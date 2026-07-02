import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@probetes/ui", "@probetes/types"]
};

export default nextConfig;
