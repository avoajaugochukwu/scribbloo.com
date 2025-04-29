import Link from 'next/link';
// Remove Image import if no longer used directly here
// import Image from 'next/image';
import { getCategories } from '../admin/actions/categories/read'; // Fetch categories
import { Constants } from '@/config/constants'; // Import constants for URLs
import CategoryThumbnail from './CategoryThumbnail'; // Import the new Client Component

// This is a React Server Component (RSC)
// It can fetch data directly using async/await
export default async function ColoringPages() {
  // Fetch categories server-side
  const categories = await getCategories();

  // Construct base URL for thumbnails
  const storageBaseUrl = `${Constants.SUPABASE_URL}/storage/v1/object/public/${Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET}/`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Coloring Pages</h1>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {categories.map((category) => {
              const thumbnailUrl = category.thumbnail_image_url
                ? `${storageBaseUrl}${category.thumbnail_image_url}`
                : null;

              return (
                <Link
                  key={category.id}
                  href={`/coloring-pages/${category.slug}`} // Link to the category page (assuming this route exists or will be created)
                  className="block border rounded-lg p-3 text-center hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {/* Use the Client Component */}
                  <CategoryThumbnail
                    thumbnailUrl={thumbnailUrl}
                    categoryName={category.name}
                    seoTitle={category.seo_title}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No categories found.</p>
        )}
      </section>

      {/* All Pages Section (Placeholder) */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Pages</h2>
        <p className="text-gray-500">Coloring page listing will go here...</p>
        {/* TODO: Implement fetching and displaying all coloring pages with pagination */}
      </section>
    </div>
  );
}

// Optional: Add metadata for the page
export const metadata = {
  title: 'Coloring Pages',
  description: 'Browse our collection of coloring pages by category.',
};