import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pos/ui", "@pos/types"],
  // output: "standalone",
};

export default nextConfig;
