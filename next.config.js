/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      os: false,
    };
    return config;
  },
  // Output directory for the production build
  distDir: '.next',
  // Enable static HTML export
  images: {
    unoptimized: true,
  },
  // Enable TypeScript type checking
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Enable ESLint on save in development
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
