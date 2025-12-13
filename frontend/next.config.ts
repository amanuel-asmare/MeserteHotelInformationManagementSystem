/*
/** @type {import('next').NextConfig} /
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '5000',
        // FIX: Allow any path from this host, not just /uploads/**
        // This will match both /uploads/avatars/image.jpg AND /default-avatar.png
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://localhost:5000/api/:path*', // <-- exact match
      },
    ];
  },
};

module.exports = nextConfig;*/

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'localhost',
          port: '5000',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'mesertehotelinformationmanagementsystem.onrender.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    // Rewrites help avoid CORS issues in some cases, but direct API calls are better
    async rewrites() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`, 
        },
        {
          source: '/uploads/:path*',
          destination: `${apiUrl}/uploads/:path*`,
        }
      ];
    },
  };
  
  module.exports = nextConfig;