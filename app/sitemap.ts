/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from 'next'
import { fetchPages } from '@/lib/notion'
import { baseUrl } from './metadata';

// Define static routes directly
const staticRoutes = [
  '/',
  '/blog',
  '/privacy-policy', // Added based on Footer
  '/terms-of-service', // Added based on Footer
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const formattedDate = new Date().toISOString();
  
  // Get all blog posts
  const posts = await fetchPages()
  const blogUrls = posts
    .map((post: any) => {
      // Ensure slug exists before creating URL
      const slug = post.properties.Slug?.rich_text?.[0]?.plain_text;
      if (!slug) return null; // Skip posts without a slug

      return {
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(post.last_edited_time || post.created_time), // Use last_edited_time if available
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap; // Filter out null entries and assert type

  // Generate URLs for static routes
  const routeUrls = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: formattedDate, // Use a fixed date for static pages or fetch specific dates if needed
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1.0 : 0.8, // Give homepage highest priority
  }));

  // Combine static and dynamic URLs
  return [...routeUrls, ...blogUrls];
} 