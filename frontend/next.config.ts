const nextConfig = {
  /* config options here */
  devIndicators: false,
  // Turbopack configuration (for --turbopack flag)
  turbopack: {
    root: process.cwd(),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
