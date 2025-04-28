import { getAllCategories } from '@/lib/coloringPages'; // Adjust import path if needed

// This is a React Server Component (RSC)
// It can fetch data directly using async/await
export default async function ColoringPages() {
  // Fetch categories on the server
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Coloring Pages</h1>

      {/* Section to display categories */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        {categories && categories.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {categories.map((category) => (
              // Assuming category object has 'id' and 'name' properties
              <li key={category.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200">
                {category.name}
              </li>
            ))}
          </ul>
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