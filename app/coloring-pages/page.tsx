import Link from 'next/link';
// Remove getCategories import if no longer needed here
// import { getCategories } from '../admin/actions/categories/read';
// Remove CategoryThumbnail import if no longer needed here
// import CategoryThumbnail from './components/CategoryThumbnail';
import CategoryListDisplay from './components/CategoryListDisplay'; // Import the new component

export default async function ColoringPages() {
  // Categories are now fetched within CategoryListDisplay
  // const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-6xl font-bold mb-8">Coloring Pages</h1>
      <section>
        <CategoryListDisplay />
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