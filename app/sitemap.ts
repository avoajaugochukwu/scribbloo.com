/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from 'next'
import { fetchPages } from '@/lib/notion'
import { baseUrl } from './metadata';
import { getCategories } from './admin/actions/categories/read';

// Define static routes directly
const staticRoutes = [
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

  // 1. Fetch all categories
  const categories = await getCategories();

  // 2. Generate category page URLs
  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/coloring-pages/${category.slug}`,
    lastModified: new Date(), // Or use a category updated_at field if available
    changeFrequency: 'weekly' as const, // Or 'monthly' if they change less often
    priority: 0.8, // Slightly lower than homepage, higher than individual pages maybe
  }));

  // 3. Add other static pages (adjust as needed)
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`, // Example static page
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // Add other static pages like /about, /contact, etc.
  ];

  // 4. (Optional) Add individual coloring page URLs if desired
  //    You would need another function like `getAllColoringPageSlugs()`
  //    const coloringPages = await getAllColoringPageSlugs();
  //    const coloringPageUrls = coloringPages.map((page) => ({
  //        url: `${baseUrl}/coloring-page/${page.slug}`, // Adjust URL structure if needed
  //        lastModified: new Date(), // Or page updated_at
  //        changeFrequency: 'monthly' as const,
  //        priority: 0.6,
  //    }));

  // 5. Combine all URLs
  return [
    ...staticUrls,
    ...routeUrls,
    ...categoryUrls,
    ...blogUrls,
    // ...coloringPageUrls, // Uncomment if adding individual pages
  ];
} 