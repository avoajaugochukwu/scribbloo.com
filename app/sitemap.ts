import { MetadataRoute } from 'next';
import { baseUrl } from './metadata';
import { getAllCollectionNodes, getAllLeaves, getRootHub } from '@/lib/content/collections';
import { getAllPosts } from '@/lib/content/blog';
import { getDocs } from '@/lib/content/docs';

/**
 * SITEMAP — rules for editing (read before changing this file).
 *
 * This is DERIVED from the content tree, never hand-maintained. It walks the same
 * index the routes use, so it cannot drift from what's actually published.
 *
 * AUTO-PICKED-UP — no edit here needed:
 *   • new collection folders (any dir with _category.mdx)   → getAllCollectionNodes
 *   • new leaves (any *.mdx in a collection folder)          → getAllLeaves
 *   • new facets (content/facets/*.mdx)                      → getRootHub().facets
 *   • new tutorials / listicles / tools / blog posts        → getDocs / getAllPosts
 *   Just add the content and rebuild. Do NOT add its URL by hand.
 *
 * NEEDS A ONE-LINE EDIT HERE:
 *   • a brand-new top-level NAMESPACE (e.g. /printables): add a hub entry + a
 *     getDocs('<dir>') line (and its route).
 *   • a new STATIC page (e.g. /about): add it to `staticRoutes`.
 *
 * NEVER put in the sitemap (it must list only indexable canonicals):
 *   • paginated URLs (/…/page/N) — they're noindex
 *   • aliases / legacy paths — they 308-redirect
 *   • any non-canonical/secondary URL for a leaf — one entry per leaf only
 *
 * `lastModified` MUST come from real content dates (createdAt/publishedAt) only.
 * NEVER use `new Date()` / `Date.now()` — stamping "now" on every build makes the
 * whole site look freshly modified and Google learns to distrust it. Undated URLs
 * omit lastmod entirely.
 *
 * At >50k URLs, split into a sitemap index via Next's generateSitemaps().
 */

const staticRoutes = ['/privacy-policy', '/terms-of-service'];

function latestDate(dates: (string | null | undefined)[]): string | undefined {
  return dates.filter((d): d is string => Boolean(d)).sort().at(-1);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, leaves, hub, posts, tutorials, ideas, tools] = await Promise.all([
    getAllCollectionNodes(),
    getAllLeaves(),
    getRootHub(),
    getAllPosts(),
    getDocs('how-to-draw'),
    getDocs('drawing-ideas'),
    getDocs('tools'),
  ]);

  const latestPage = latestDate(leaves.map((l) => l.page.createdAt));
  const latestPost = latestDate(posts.map((p) => p.publishedAt));
  const latestContent = latestDate([latestPage, latestPost]);
  const toDate = (iso?: string) => (iso ? new Date(iso) : undefined);

  const hubUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: toDate(latestContent), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/coloring-pages`, lastModified: toDate(latestPage), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: toDate(latestPost), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/how-to-draw`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/drawing-ideas`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/tools`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const routeUrls: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  // Collection nodes (every folder with _category.mdx) + facets, at their canonical path.
  const collectionUrls: MetadataRoute.Sitemap = [
    ...collections.map((node) => ({
      url: `${baseUrl}${node.href}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...hub.facets.map((f) => ({
      url: `${baseUrl}/coloring-pages/${f.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  // One canonical URL per leaf (its folder path).
  const leafUrls: MetadataRoute.Sitemap = leaves.map((l) => ({
    url: `${baseUrl}${l.href}`,
    lastModified: toDate(l.page.createdAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const docUrls = (base: string, docs: { slug: string }[], priority: number): MetadataRoute.Sitemap =>
    docs.map((d) => ({ url: `${baseUrl}${base}/${d.slug}`, changeFrequency: 'monthly', priority }));

  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: toDate(post.publishedAt ?? undefined),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...hubUrls,
    ...routeUrls,
    ...collectionUrls,
    ...leafUrls,
    ...blogUrls,
    ...docUrls('/how-to-draw', tutorials, 0.6),
    ...docUrls('/drawing-ideas', ideas, 0.6),
    ...docUrls('/tools', tools, 0.5),
  ];
}
