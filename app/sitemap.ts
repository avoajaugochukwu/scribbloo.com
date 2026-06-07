import { MetadataRoute } from 'next';
import { baseUrl } from './metadata';
import { getAllCategories, getAllColoringPages } from '@/lib/content/coloringPages';
import { getAncestors, getLeafCanonicalHref } from '@/lib/content/collections';
import { getAllPosts } from '@/lib/content/blog';
import { getDocs } from '@/lib/content/docs';

// Static, always-present routes.
const staticRoutes = ['/privacy-policy', '/terms-of-service'];

// Latest ISO date string in a list, or undefined if the list is empty.
function latestDate(dates: (string | null | undefined)[]): string | undefined {
  return dates.filter((d): d is string => Boolean(d)).sort().at(-1);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, coloringPages, posts, tutorials, ideas, tools] = await Promise.all([
    getAllCategories(),
    getAllColoringPages(),
    getAllPosts(),
    getDocs('how-to-draw'),
    getDocs('drawing-ideas'),
    getDocs('tools'),
  ]);

  const latestPage = latestDate(coloringPages.map((p) => p.createdAt));
  const latestPost = latestDate(posts.map((p) => p.publishedAt));
  const latestContent = latestDate([latestPage, latestPost]);
  const toDate = (iso?: string) => (iso ? new Date(iso) : undefined);

  // Top-level / hub pages.
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

  // Collection pages — every node in the tree, at its canonical (ancestor) path.
  const collectionUrls: MetadataRoute.Sitemap = await Promise.all(
    categories.map(async (c) => {
      const ancestors = await getAncestors(c.slug);
      const href = ancestors.at(-1)?.href ?? `/coloring-pages/${c.slug}`;
      const newest = latestDate(
        coloringPages.filter((p) => (p.subject ?? p.categories[0]) === c.slug).map((p) => p.createdAt),
      );
      return {
        url: `${baseUrl}${href}`,
        lastModified: toDate(newest ?? latestContent),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    }),
  );

  // Coloring-page detail pages — exactly one canonical URL per page (its subject
  // tree path), so we never emit duplicate secondary-category URLs.
  const leafUrls: MetadataRoute.Sitemap = (
    await Promise.all(
      coloringPages.map(async (page) => {
        const href = await getLeafCanonicalHref(page);
        if (!href) return null;
        return {
          url: `${baseUrl}${href}`,
          lastModified: toDate(page.createdAt),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        };
      }),
    )
  ).filter((u): u is NonNullable<typeof u> => u !== null);

  // Other namespaces.
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
