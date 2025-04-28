import { getAllCategories } from '@/lib/coloringPages'; // Adjust import path if needed
import Link from 'next/link'; // Make sure Link is imported
import { Category } from '@/types/database'; // Import the Category type

// This is a React Server Component (RSC)
// It can fetch data directly using async/await
export default async function ColoringPages() {
  // Fetch categories on the server
  const categories: Category[] = await getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Coloring Pages</h1>

      {/* Section to display categories */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Map over the categories */}
            {categories.map((category) => (
              // Wrap the entire card/item in a Link component
              <Link
                // Use the category slug to build the href
                href={`/coloring-pages/${category.slug}`}
                key={category.id}
                // Apply styling to the link itself if needed, or style the inner div
                className="block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4">
                  {/* Display the category name */}
                  <h2 className="font-semibold text-lg text-center text-blue-700 hover:underline">
                    {category.name}
                  </h2>
                  {/* You could add category descriptions or image counts here later */}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>No categories found.</p>
        )}
        {/* You might want to add error handling here if categories is null */}
         {!categories && <p className="text-red-500">Could not load categories.</p>}
      </section>

      {/* Placeholder for displaying actual coloring pages */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Pages</h2>
        {/* TODO: Fetch and display coloring pages here */}
        <p>Coloring page listing will go here...</p>
      </section>
    </div>
  );
}

// Optional: Add metadata for the page
export const metadata = {
  title: 'Coloring Pages',
  description: 'Browse our collection of coloring pages by category.',
};