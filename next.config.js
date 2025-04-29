/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations you might have ...

  // Add or modify the experimental block for serverActions
  experimental: {
    serverActions: {
      bodySizeLimit: '7mb', // Increase the limit to 7MB
    },
    // ... other experimental flags ...
  },

  // OR, if serverActions is stable in your Next.js version, configure it at the top level:
  // serverActions: {
  //   bodySizeLimit: '7mb',
  // },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
        port: '',
        pathname: '/**', // Allow any path under this hostname
      },
      {
        protocol: 'https',
        hostname: 'hmmbilteoshdhougrfik.supabase.co', // Replace with your actual Supabase project ID hostname
        port: '',
        pathname: '/storage/v1/object/public/**', // Allows any path within the public storage
      },
      // Add other hostnames if you use images from other sources
      // Example: { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;

// If using ESM (next.config.mjs):
// export default nextConfig; 