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
      {
        protocol: 'https',
        hostname: 'hmmbilteoshdhougrfik.supabase.co', // Replace with your actual Supabase project ID hostname
        port: '',
        pathname: '/storage/v1/object/public/images/**', // Adjust if your bucket name or path structure is different
      },
      // Add other hostnames if you use images from other sources
      // Example: { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig; 