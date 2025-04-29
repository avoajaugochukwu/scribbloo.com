import Link from 'next/link';
import { getCategories } from '../admin/actions/categories/read';
import CategoryThumbnail from './components/CategoryThumbnail';

export default async function ColoringPages() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-6xl font-bold mb-8">Coloring Pages</h1>

      {/* Categories Section */}
      <section className="mb-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {categories.map((category) => {
              return (
                <Link
                  key={category.id}
                  href={`/coloring-pages/${category.slug}`} // Link to the category page (assuming this route exists or will be created)
                  className="block border rounded-lg p-3 text-center hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {/* Use the Client Component */}
                  <CategoryThumbnail
                    category={category}
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