import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pos/ui"],
  output: "standalone",
};

export default nextConfig;
