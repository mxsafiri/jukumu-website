import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  webpack: (config: any) => {
    config.externals.push('pg-native');
    return config;
  }
};

export default nextConfig;
