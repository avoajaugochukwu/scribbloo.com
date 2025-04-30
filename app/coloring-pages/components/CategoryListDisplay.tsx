import Link from 'next/link';
import { getCategories } from '@/app/admin/actions/categories/read'; // Adjust path if needed
import CategoryThumbnail from './CategoryThumbnail'; // Assuming it's in the same folder
import Category from '@/types/category.type';

// This is a React Server Component (RSC) as it fetches data
export default async function CategoryListDisplay() {
  const categories = await getCategories();

  if (!categories || categories.length === 0) {
    return <p className="text-center text-muted-foreground">No categories found.</p>;
  }

  return (
    // Responsive Grid: 1 col default, 2 cols sm+, 3 cols lg+, 4 cols xl+
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full">
      {categories.map((category: Category) => (
        <Link
          href={`/coloring-pages/${category.slug}`}
          key={category.id}
          className="group block border border-border rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 text-center" // Added text-center
        >
          {/* CategoryThumbnail likely contains the Image and Span */}
          <CategoryThumbnail category={category} />
        </Link>
      ))}
    </div>
  );
} 