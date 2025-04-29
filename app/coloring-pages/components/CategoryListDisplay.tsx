import Link from 'next/link';
import { getCategories } from '@/app/admin/actions/categories/read'; // Adjust path if needed
import CategoryThumbnail from './CategoryThumbnail'; // Assuming it's in the same folder

// This is a React Server Component (RSC) as it fetches data
export default async function CategoryListDisplay() {
  const categories = await getCategories();

  return (
    <>
      {categories.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 md:gap-6"> {/* Grid layout */}
          {categories.map((category) => {
            // Basic check for essential category data
            if (!category || !category.id || !category.slug) {
              console.warn('Skipping category due to missing id or slug:', category);
              return null; // Skip rendering this category if essential data is missing
            }
            return (
              <Link
                key={category.id}
                href={`/coloring-pages/${category.slug}`}
                className="block border rounded-lg p-3 text-center hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group" // Added group for hover effects if needed in thumbnail
              >
                {/* Use the Client Component for the thumbnail */}
                <CategoryThumbnail category={category} />
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No categories found.</p> // Fallback message
      )}
    </>
  );
} 