/** @type {import('next').NextConfig} */

// Images are served as local static files from /public by default, so no remote
// patterns are required. To move images to a CDN/object store later, set
// NEXT_PUBLIC_IMAGE_BASE_URL (e.g. https://cdn.scribbloo.com) and its host is
// whitelisted here automatically — see lib/images.ts.
const remotePatterns = [];
if (process.env.NEXT_PUBLIC_IMAGE_BASE_URL) {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_IMAGE_BASE_URL);
    remotePatterns.push({
      protocol: u.protocol.replace(':', ''),
      hostname: u.hostname,
      pathname: '/**',
    });
  } catch {
    // ignore malformed env value
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;
