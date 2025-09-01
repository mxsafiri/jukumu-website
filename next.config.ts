import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  output: 'standalone',
  webpack: (config: any) => {
    config.externals.push('pg-native');
    return config;
  }
};

export default nextConfig;
