import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.paypal.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // This is to fix the Cross-Origin error in the development environment
    allowedDevOrigins: [
      "https://6000-firebase-studio-1763003031757.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
