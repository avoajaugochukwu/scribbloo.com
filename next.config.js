/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations you might have ...

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
        port: '',
        pathname: '/**', // Allow any path under this hostname
      },
      // Add other hostnames if you use images from other sources
      // Example: { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig; 