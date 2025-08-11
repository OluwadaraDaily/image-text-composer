import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle canvas dependency for Konva
    if (isServer) {
      config.externals = [...(config.externals || []), { canvas: "canvas" }];
    }
    return config;
  },
};

export default nextConfig;
