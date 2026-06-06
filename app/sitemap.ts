import { MetadataRoute } from 'next';
import { baseUrl } from './metadata';
import { getAllCategories, getAllColoringPages } from '@/lib/content/coloringPages';
import { getAllPosts } from '@/lib/content/blog';

// Static, always-present routes.
const staticRoutes = ['/privacy-policy', '/terms-of-service'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [categories, coloringPages, posts] = await Promise.all([
    getAllCategories(),
    getAllColoringPages(),
    getAllPosts(),
  ]);

  // Top-level / hub pages.
  const hubUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/coloring-pages`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const routeUrls: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Category landing pages.
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/coloring-pages/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Individual coloring-page detail pages. A page can live in several
  // categories, but its canonical URL uses the FIRST (primary) category — so we
  // emit exactly one sitemap entry per page to match the canonical and avoid
  // duplicate-content signals.
  const coloringPageUrls: MetadataRoute.Sitemap = coloringPages
    .filter((page) => page.categories.length > 0)
    .map((page) => ({
      url: `${baseUrl}/coloring-pages/${page.categories[0]}/${page.slug}`,
      lastModified: page.createdAt ? new Date(page.createdAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  // Blog posts.
  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...hubUrls, ...routeUrls, ...categoryUrls, ...coloringPageUrls, ...blogUrls];
}
