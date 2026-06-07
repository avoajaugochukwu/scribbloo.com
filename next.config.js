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

// Blog consolidation: these near-duplicate "drawing ideas for beginners"
// variants were cannibalizing the pillar post and getting flagged
// "Crawled - currently not indexed" in Search Console. We 301 (308) them into
// the single canonical pillar to concentrate ranking signal. The matching MDX
// files have been removed so they also drop out of the sitemap.
const BLOG_PILLAR = '/blog/drawing-ideas-for-beginners';
const consolidatedBlogSlugs = [
  'easy-drawing-ideas-for-beginners',
  'simple-drawing-ideas-for-beginners',
  'sketch-drawing-ideas-for-beginners',
  'cool-drawing-ideas-for-beginners',
  'easy-sketch-drawing-ideas-for-beginners',
  'beginner-drawing-ideas',
  'drawing-ideas-for-beginners-easy-sketches-tutorials-tips',
];

// Long-lived cache headers for static assets. Ported from vercel.json when the
// app moved off Vercel onto Railway — Next.js uses the same path-to-regexp as
// Vercel, so these `source` patterns are 1:1 with the old config. Cloudflare's
// CDN sits in front of Railway and honors these origin headers.
const cacheHeaders = [
  {
    source: '/(.*)\\.(jpg|jpeg|png|webp|svg|ico|gif)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
    ],
  },
  {
    source: '/(.*)\\.(js|css)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ],
  },
  {
    source: '/(.*)\\.(woff2|woff|ttf|eot|otf)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ],
  },
  {
    source: '/(.*)\\.(pdf|txt)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
    ],
  },
];

const nextConfig = {
  images: {
    remotePatterns,
  },
  async redirects() {
    return consolidatedBlogSlugs.map((slug) => ({
      source: `/blog/${slug}`,
      destination: BLOG_PILLAR,
      permanent: true,
    }));
  },
  async headers() {
    return cacheHeaders;
  },
};

module.exports = nextConfig;
