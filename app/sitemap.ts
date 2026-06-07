import { MetadataRoute } from 'next';
import { baseUrl } from './metadata';
import { getAllCategories, getAllColoringPages } from '@/lib/content/coloringPages';
import { getAllPosts } from '@/lib/content/blog';

// Static, always-present routes.
const staticRoutes = ['/privacy-policy', '/terms-of-service'];

// Latest ISO date string in a list, or undefined if the list is empty.
function latestDate(dates: (string | null | undefined)[]): string | undefined {
  return dates.filter((d): d is string => Boolean(d)).sort().at(-1);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, coloringPages, posts] = await Promise.all([
    getAllCategories(),
    getAllColoringPages(),
    getAllPosts(),
  ]);

  // Honest lastModified signals derived from real content timestamps. Stamping
  // `new Date()` on every entry made everything look modified on each build,
  // which Google learns to distrust — so hubs/categories reflect the newest
  // content they actually contain.
  const latestPage = latestDate(coloringPages.map((p) => p.createdAt));
  const latestPost = latestDate(posts.map((p) => p.publishedAt));
  const latestContent = latestDate([latestPage, latestPost]);

  const toDate = (iso?: string) => (iso ? new Date(iso) : undefined);

  // Top-level / hub pages.
  const hubUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: toDate(latestContent), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/coloring-pages`, lastModified: toDate(latestPage), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: toDate(latestPost), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Static legal pages rarely change — omit lastModified rather than fake it.
  const routeUrls: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  // Category landing pages — dated by the newest page they contain.
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => {
    const newestInCategory = latestDate(
      coloringPages.filter((p) => p.categories.includes(category.slug)).map((p) => p.createdAt),
    );
    return {
      url: `${baseUrl}/coloring-pages/${category.slug}`,
      lastModified: toDate(newestInCategory ?? latestContent),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  // Individual coloring-page detail pages. A page can live in several
  // categories, but its canonical URL uses the FIRST (primary) category — so we
  // emit exactly one sitemap entry per page to match the canonical and avoid
  // duplicate-content signals.
  const coloringPageUrls: MetadataRoute.Sitemap = coloringPages
    .filter((page) => page.categories.length > 0)
    .map((page) => ({
      url: `${baseUrl}/coloring-pages/${page.categories[0]}/${page.slug}`,
      lastModified: toDate(page.createdAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // Blog posts.
  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: toDate(post.publishedAt ?? undefined),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...hubUrls, ...routeUrls, ...categoryUrls, ...coloringPageUrls, ...blogUrls];
}
