import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@sixdegrees/ui', '@sixdegrees/types', '@sixdegrees/utils'],
};

export default nextConfig;
