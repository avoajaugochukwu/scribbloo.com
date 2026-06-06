import Link from 'next/link';
import { getAllCategories } from '@/lib/content/coloringPages';
import CategoryThumbnail from './CategoryThumbnail';
import type { Category } from '@/lib/content/types';

// This is a React Server Component (RSC) as it fetches data
export default async function CategoryListDisplay() {
  const categories = await getAllCategories();

  if (!categories || categories.length === 0) {
    return <p className="text-center text-muted-foreground">No categories found.</p>;
  }

  return (
    // Responsive Grid: 1 col default, 2 cols sm+, 3 cols lg+, 4 cols xl+
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full">
      {categories.map((category: Category) => (
        <Link
          href={`/coloring-pages/${category.slug}`}
          key={category.slug}
          className="group block border border-border rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 text-center"
        >
          <CategoryThumbnail category={category} />
        </Link>
      ))}
    </div>
  );
}
